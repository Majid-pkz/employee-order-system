import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@libsql/client";
import { createHash, randomUUID } from "node:crypto";
import { mkdtemp, readFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

test("upgrade keeps legacy orders, retires images and initializes the next number", async () => {
  const root = path.join(process.cwd(), ".test-data");
  await mkdir(root, { recursive: true });
  const directory = await mkdtemp(path.join(root, "migration-"));
  const url = "file:" + path.join(directory, "upgrade.db");
  const client = createClient({ url });
  try {
    const original = ["20260804082645_init", "20260805033944_update_product_pricing_and_image"];
    for (const name of original) await client.executeMultiple(await readFile(path.join("prisma/migrations", name, "migration.sql"), "utf8"));
    await client.executeMultiple(`
      CREATE TABLE "_prisma_migrations" ("id" TEXT PRIMARY KEY, "checksum" TEXT NOT NULL, "finished_at" DATETIME, "migration_name" TEXT NOT NULL, "logs" TEXT, "rolled_back_at" DATETIME, "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "applied_steps_count" INTEGER NOT NULL DEFAULT 0);
      INSERT INTO "Employee" ("id","employeeId","fullName","pinHash","updatedAt") VALUES ('legacy-employee','LEGACY001','Fictional Employee',NULL,CURRENT_TIMESTAMP);
      INSERT INTO "Product" ("id","name","marketPrice","discountedPrice","imagePath","updatedAt") VALUES ('legacy-product','Milk',5,3.2,'/uploads/products/former.png',CURRENT_TIMESTAMP);
      INSERT INTO "OrderCycle" ("id","name","status","createdAt","updatedAt") VALUES ('old-cycle','Older cycle','open','2026-01-01',CURRENT_TIMESTAMP),('recent-cycle','Recent cycle','open','2026-02-01',CURRENT_TIMESTAMP);
      INSERT INTO "CycleProduct" ("id","cycleId","productId","price","maxQtyPerPerson") VALUES ('legacy-cp','recent-cycle','legacy-product',3.2,4);
      INSERT INTO "Order" ("id","cycleId","employeeId","employeeName","orderNumber","totalAmount","updatedAt") VALUES ('legacy-order','recent-cycle','LEGACY001','Fictional Employee','REC-0042',6.4,CURRENT_TIMESTAMP);
      INSERT INTO "OrderItem" ("id","orderId","cycleProductId","quantity","unitPrice","lineTotal") VALUES ('legacy-item','legacy-order','legacy-cp',2,3.2,6.4);
    `);
    for (const name of original) {
      const sql = await readFile(path.join("prisma/migrations", name, "migration.sql"), "utf8");
      await client.execute({ sql: 'INSERT INTO "_prisma_migrations" ("id","checksum","migration_name","finished_at","applied_steps_count") VALUES (?,?,?,?,1)', args: [randomUUID(), createHash("sha256").update(sql).digest("hex"), name, new Date().toISOString()] });
    }
    const migrate = () => spawnSync(process.execPath, ["--import", "tsx", "scripts/migrate.ts"], { env: { ...process.env, DATABASE_URL: url, DATABASE_AUTH_TOKEN: "" }, encoding: "utf8" });
    const first = migrate();
    assert.equal(first.status, 0, first.stderr);
    const order = (await client.execute('SELECT * FROM "Order" WHERE "id" = \'legacy-order\'')).rows[0];
    assert.equal(order.employeeId, "LEGACY001");
    assert.equal(Number(order.totalAmount), 6.4);
    assert.equal(Number(order.requiresSignature), 1);
    assert.equal((await client.execute('SELECT * FROM "OrderItem"')).rows.length, 1);
    assert.equal((await client.execute('SELECT "imagePath" FROM "Product"')).rows[0].imagePath, null);
    assert.equal(Number((await client.execute('SELECT "nextOrderNumber" FROM "OrderCycle" WHERE "id" = \'recent-cycle\'')).rows[0].nextOrderNumber), 43);
    assert.equal((await client.execute('SELECT "status" FROM "OrderCycle" WHERE "id" = \'old-cycle\'')).rows[0].status, "closed");
    assert.equal((await client.execute('SELECT * FROM "OrderCycle" WHERE "status" = \'open\'')).rows.length, 1);
    assert.equal((await client.execute("PRAGMA foreign_key_check")).rows.length, 0);
    assert.equal(migrate().status, 0, "A second migration run should do nothing.");
    await assert.rejects(() => client.execute('UPDATE "OrderCycle" SET "status" = \'open\' WHERE "id" = \'old-cycle\''), /UNIQUE/);
  } finally { client.close(); await rm(directory, { recursive: true, force: true }); }
});
