import { createHmac } from "node:crypto";
import { prisma } from "@/lib/prisma";

function keyFor(role: string, identifier: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required.");
  return createHmac("sha256", secret).update(role + ":" + identifier.toLowerCase()).digest("hex");
}
export async function consumeLoginAttempt(role: string, identifier: string) {
  await prisma.loginAttempt.deleteMany({ where: { resetAt: { lt: new Date(Date.now() - 86400000) } } });
  const key = keyFor(role, identifier);
  const now = new Date();
  const resetAt = new Date(now.getTime() + 15 * 60 * 1000);
  await prisma.loginAttempt.upsert({ where: { key }, create: { key, resetAt }, update: {} });
  await prisma.loginAttempt.updateMany({ where: { key, resetAt: { lte: now } }, data: { attempts: 0, resetAt } });
  const bucket = await prisma.loginAttempt.update({ where: { key }, data: { attempts: { increment: 1 } } });
  return bucket.attempts <= 5;
}
export async function clearLoginAttempts(role: string, identifier: string) {
  await prisma.loginAttempt.deleteMany({ where: { key: keyFor(role, identifier) } });
}
