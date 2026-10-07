import { prisma } from "@/lib/prisma";
export function getOpenCycle() {
  const now = new Date();
  return prisma.orderCycle.findFirst({
    where: { status: "open", AND: [
      { OR: [{ deadline: null }, { deadline: { gt: now } }] },
      { OR: [{ startDate: null }, { startDate: { lte: now } }] },
    ] },
    include: { cycleProducts: {
      where: { isAvailable: true, product: { isActive: true } },
      include: { product: true },
      orderBy: { product: { name: "asc" } },
    } },
    orderBy: { createdAt: "desc" },
  });
}
export function formatDeadline(date: Date) {
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: process.env.APP_TIMEZONE || "Australia/Sydney", timeZoneName: "short" }).format(date);
}
