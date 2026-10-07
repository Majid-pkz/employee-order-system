import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@libsql/client";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { assertDemoDatabase } from "../src/lib/demo-deployment";
import { databaseConfig } from "../src/lib/database-config";

test("Turso marketplace variables configure the hosted database", () => {
  assert.deepEqual(databaseConfig({ TURSO_DATABASE_URL: "libsql://demo.turso.io", TURSO_AUTH_TOKEN: "test-token", NODE_ENV: "production" }), { url: "libsql://demo.turso.io", authToken: "test-token" });
  assert.throws(() => databaseConfig({ NODE_ENV: "production" }), /persistent database/);
  assert.throws(() => databaseConfig({ TURSO_DATABASE_URL: "libsql://demo.turso.io" }), /AUTH_TOKEN/);
});

test("explicit demo preparation preserves existing orders, credentials and cycle state", async () => {
  const root = path.join(process.cwd(), ".test-data");
  await mkdir(root, { recursive: true });
  const directory = await mkdtemp(path.join(root, "demo-setup-"));
  const url = "file:" + path.join(directory, "fixture.db");
  const client = createClient({ url });
  const prepare = (seed: boolean) => spawnSync(process.execPath, ["--import", "tsx", "scripts/prepare-demo.ts"], {
    cwd: process.cwd(), encoding: "utf8",
    env: {
      ...process.env, DATABASE_URL: url, DATABASE_AUTH_TOKEN: "", DEMO_MODE: "true",
      ALLOW_DEMO_SEED: String(seed), DEMO_EMPLOYEE_ID: "DEMO001", DEMO_ADMIN_USERNAME: "demo-admin",
      DEMO_EMPLOYEE_PASSWORD: "SyntheticVisitor2026!", DEMO_ADMIN_PASSWORD: "SyntheticAdmin2026!",
    },
  });
  try {
    const first = prepare(true);
    assert.equal(first.status, 0, first.stderr);
    const employee = (await client.execute('SELECT "pinHash" FROM "Employee" WHERE "employeeId" = \'DEMO001\'')).rows[0];
    const cycle = (await client.execute('SELECT "id", "deadline" FROM "OrderCycle"')).rows[0];
    await client.execute({ sql: 'UPDATE "OrderCycle" SET "status" = \'closed\', "nextOrderNumber" = 8 WHERE "id" = ?', args: [cycle.id] });
    await client.execute({ sql: 'INSERT INTO "Order" ("id", "cycleId", "employeeId", "employeeName", "orderNumber", "totalAmount", "updatedAt") VALUES (\'preserved-order\', ?, \'DEMO001\', \'Ava Thompson\', \'0007\', 3.20, CURRENT_TIMESTAMP)', args: [cycle.id] });
    for (const seed of [false, true]) {
      const repeat = prepare(seed);
      assert.equal(repeat.status, 0, repeat.stderr);
    }
    assert.equal((await client.execute('SELECT "pinHash" FROM "Employee" WHERE "employeeId" = \'DEMO001\'')).rows[0].pinHash, employee.pinHash);
    const preservedCycle = (await client.execute('SELECT "status", "deadline", "nextOrderNumber" FROM "OrderCycle"')).rows[0];
    assert.equal(preservedCycle.status, "closed");
    assert.equal(preservedCycle.deadline, cycle.deadline);
    assert.equal(preservedCycle.nextOrderNumber, 8);
    assert.equal((await client.execute('SELECT "id" FROM "Order"')).rows[0].id, "preserved-order");
    assert.equal((await client.execute('SELECT "id" FROM "Product"')).rows.length, 6);
    await client.execute('CREATE TABLE "BusinessCustomers" ("id" TEXT)');
    const blocked = prepare(true);
    assert.equal(blocked.status, 1);
    assert.match(blocked.stderr, /Unrelated tables/);
    assert.equal((await client.execute('SELECT "id" FROM "Order"')).rows[0].id, "preserved-order");
  } finally { client.close(); await rm(directory, { recursive: true, force: true }); }
});

test("deployment preflight checks the database before changing business records", async () => {
  const root = path.join(process.cwd(), ".test-data");
  await mkdir(root, { recursive: true });
  const directory = await mkdtemp(path.join(root, "demo-preflight-"));
  const client = createClient({ url: "file:" + path.join(directory, "fixture.db") });
  try {
    assert.equal(await assertDemoDatabase(client, "DEMO001", "demo-admin"), false);
    await client.executeMultiple(`CREATE TABLE "Employee" ("employeeId" TEXT); CREATE TABLE "Admin" ("username" TEXT); CREATE TABLE "Product" ("sku" TEXT); CREATE TABLE "Order" ("employeeId" TEXT); INSERT INTO "Employee" VALUES ('DEMO001'); INSERT INTO "Admin" VALUES ('demo-admin'); INSERT INTO "Product" VALUES ('DEMO-MILK'); INSERT INTO "Order" VALUES ('DEMO001');`);
    assert.equal(await assertDemoDatabase(client, "DEMO001", "demo-admin"), true);
    await client.execute('INSERT INTO "Employee" VALUES (\'REAL001\')');
    await assert.rejects(() => assertDemoDatabase(client, "DEMO001", "demo-admin"), /business records/);
    assert.equal((await client.execute('SELECT * FROM "Employee"')).rows.length, 2, "Business records must remain untouched.");
    await client.execute('DELETE FROM "Employee" WHERE "employeeId" = \'REAL001\'');
    await client.execute('INSERT INTO "Product" VALUES (NULL)');
    await assert.rejects(() => assertDemoDatabase(client, "DEMO001", "demo-admin"), /business records/);
    await client.execute('DELETE FROM "Product" WHERE "sku" IS NULL');
    await client.execute('INSERT INTO "Admin" VALUES (\'work-admin\')');
    await assert.rejects(() => assertDemoDatabase(client, "DEMO001", "demo-admin"), /business records/);
    await client.execute('DELETE FROM "Admin" WHERE "username" = \'work-admin\'');
    await client.execute('INSERT INTO "Order" VALUES (NULL)');
    await assert.rejects(() => assertDemoDatabase(client, "DEMO001", "demo-admin"), /business records/);
    await client.execute('DELETE FROM "Order" WHERE "employeeId" IS NULL');
    await client.execute('CREATE TABLE "BusinessCustomers" ("id" TEXT)');
    await assert.rejects(() => assertDemoDatabase(client, "DEMO001", "demo-admin"), /Unrelated tables/);
  } finally { client.close(); await rm(directory, { recursive: true, force: true }); }
});
