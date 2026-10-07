import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@libsql/client";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { assertDemoDatabase } from "../src/lib/demo-deployment";
import { databaseConfig } from "../src/lib/database-config";

test("Turso marketplace variables configure the hosted database", () => {
  assert.deepEqual(databaseConfig({ TURSO_DATABASE_URL: "libsql://demo.turso.io", TURSO_AUTH_TOKEN: "test-token", NODE_ENV: "production" }), { url: "libsql://demo.turso.io", authToken: "test-token" });
  assert.throws(() => databaseConfig({ NODE_ENV: "production" }), /persistent database/);
  assert.throws(() => databaseConfig({ TURSO_DATABASE_URL: "libsql://demo.turso.io" }), /AUTH_TOKEN/);
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
