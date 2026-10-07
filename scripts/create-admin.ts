import "dotenv/config";
import { hash } from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { passcodeSchema } from "../src/lib/validation";
async function main() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = passcodeSchema.parse(process.env.ADMIN_PASSWORD);
  if (!username || username.length > 80) throw new Error("Set ADMIN_USERNAME and a strong ADMIN_PASSWORD.");
  const existing = await prisma.admin.findUnique({ where: { username } });
  if (existing && process.env.ADMIN_RESET_PASSWORD !== "true") throw new Error("Admin already exists. Set ADMIN_RESET_PASSWORD=true only when intentionally resetting this account.");
  await prisma.admin.upsert({ where: { username }, create: { username, passwordHash: await hash(password, 12), name: process.env.ADMIN_NAME || username }, update: { passwordHash: await hash(password, 12), sessionVersion: { increment: 1 }, isActive: true } });
  console.log("Administrator provisioned:", username);
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Provisioning failed."); process.exitCode = 1; }).finally(() => prisma.$disconnect());
