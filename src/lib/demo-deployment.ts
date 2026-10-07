import type { Client } from "@libsql/client";
import { demoProducts } from "./catalog";

const applicationTables = new Set([
  "Admin", "Employee", "Product", "OrderCycle", "CycleProduct",
  "Order", "OrderItem", "LoginAttempt", "_prisma_migrations",
]);

export async function assertDemoDatabase(
  client: Client,
  employeeId: string,
  adminUsername: string,
) {
  const rows = await client.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'libsql_%'",
  );
  const tables = new Set(rows.rows.map(row => String(row.name)));
  if ([...tables].some(name => !applicationTables.has(name))) {
    throw new Error("Use a new, separate demo database. Unrelated tables were found.");
  }
  const employeeIds = [employeeId, "DEMO002", "DEMO003"];
  const reject = () => { throw new Error("Refusing to change a database containing business records. Use a separate empty demo database."); };
  const check = async (sql: string, args: string[] = []) => {
    if ((await client.execute({ sql, args })).rows.length) reject();
  };
  if (tables.has("Employee")) {
    await check('SELECT 1 FROM "Employee" WHERE "employeeId" NOT IN (?,?,?) LIMIT 1', employeeIds);
  }
  if (tables.has("Admin")) {
    await check('SELECT 1 FROM "Admin" WHERE "username" != ? LIMIT 1', [adminUsername]);
  }
  if (tables.has("Product") && (await client.execute('SELECT 1 FROM "Product" LIMIT 1')).rows.length) {
    const columns = await client.execute('PRAGMA table_info("Product")');
    if (!columns.rows.some(row => row.name === "sku")) reject();
    const skus = demoProducts.map(product => product.sku);
    await check('SELECT 1 FROM "Product" WHERE "sku" IS NULL OR "sku" NOT IN (' + skus.map(() => "?").join(",") + ") LIMIT 1", skus);
  }
  if (tables.has("Order")) {
    await check('SELECT 1 FROM "Order" WHERE "employeeId" IS NULL OR "employeeId" NOT IN (?,?,?) LIMIT 1', employeeIds);
  }
  if (tables.has("OrderCycle") && !tables.has("Employee")) reject();
  if (!tables.has("Employee")) return false;
  return Boolean((await client.execute({ sql: 'SELECT 1 FROM "Employee" WHERE "employeeId" = ? LIMIT 1', args: [employeeId] })).rows.length);
}
