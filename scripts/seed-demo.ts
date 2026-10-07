import "dotenv/config";
import { hash } from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { demoProducts } from "../src/lib/catalog";
import { passcodeSchema } from "../src/lib/validation";
async function main() {
  if (process.env.DEMO_MODE !== "true" || process.env.ALLOW_DEMO_SEED !== "true") throw new Error("Demo seeding requires DEMO_MODE=true and ALLOW_DEMO_SEED=true. Use a separate demonstration database.");
  const employeePassword = passcodeSchema.parse(process.env.DEMO_EMPLOYEE_PASSWORD);
  const adminPassword = passcodeSchema.parse(process.env.DEMO_ADMIN_PASSWORD);
  const primaryId = process.env.DEMO_EMPLOYEE_ID || "DEMO001";
  const allowedEmployees = [primaryId, "DEMO002", "DEMO003"];
  const unexpectedEmployee = await prisma.employee.findFirst({ where: { employeeId: { notIn: allowedEmployees } } });
  const unexpectedProduct = await prisma.product.findFirst({ where: { OR: [{ sku: null }, { sku: { notIn: demoProducts.map(p => p.sku) } }] } });
  const unexpectedCycle = await prisma.orderCycle.findFirst({ where: { name: { not: "The everyday edit" } } });
  if (unexpectedEmployee || unexpectedProduct || unexpectedCycle) throw new Error("Refusing to mix demo data with existing business records. Use a separate demo database.");
  const pinHash = await hash(employeePassword, 12);
  for (const [employeeId, fullName] of [[primaryId, "Ava Thompson"], ["DEMO002", "Lee Chen"], ["DEMO003", "Sam Patel"]]) {
    await prisma.employee.upsert({ where: { employeeId }, create: { employeeId, fullName, pinHash }, update: {} });
  }
  const username = process.env.DEMO_ADMIN_USERNAME || "demo-admin";
  await prisma.admin.upsert({ where: { username }, create: { username, name: "Demo Administrator", passwordHash: await hash(adminPassword, 12) }, update: {} });
  let cycle = await prisma.orderCycle.findFirst({ where: { name: "The everyday edit" } });
  if (!cycle) {
    if (await prisma.orderCycle.findFirst({ where: { status: "open" } })) throw new Error("An existing cycle is open. Refusing to seed into a live sales workflow.");
    cycle = await prisma.orderCycle.create({ data: { name: "The everyday edit", status: "open", deadline: new Date(Date.now() + 30 * 86400000) } });
  }
  for (const { maxQty, ...data } of demoProducts) {
    const product = await prisma.product.upsert({ where: { sku: data.sku }, create: data, update: {} });
    await prisma.cycleProduct.upsert({ where: { cycleId_productId: { cycleId: cycle.id, productId: product.id } }, create: { cycleId: cycle.id, productId: product.id, price: data.discountedPrice, maxQtyPerPerson: maxQty }, update: {} });
  }
  console.log("Demo catalogue ready. Employee:", primaryId, "Administrator:", username);
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Demo seeding failed."); process.exitCode = 1; }).finally(() => prisma.$disconnect());
