import { Prisma, type Employee } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import { itemsSchema } from "@/lib/validation";
import type { z } from "zod";

type Items = z.infer<typeof itemsSchema>;
type Tx = Prisma.TransactionClient;
export function assertCycleOpen(cycle: { status: string; deadline: Date | null; startDate?: Date | null } | null, now = new Date()) {
  if (!cycle || cycle.status !== "open") throw new ApiError(409, "This order cycle is closed.");
  if (cycle.startDate && cycle.startDate > now) throw new ApiError(409, "This order cycle has not started yet.");
  if (cycle.deadline && cycle.deadline <= now) throw new ApiError(409, "The order deadline has passed.");
}
async function validateEmployee(tx: Tx, employee: Employee) {
  const current = await tx.employee.findFirst({ where: { id: employee.id, isActive: true, sessionVersion: employee.sessionVersion, pinHash: { not: null } } });
  if (!current) throw new ApiError(401, "Your session has expired. Please sign in again.");
  return current;
}
async function calculateItems(tx: Tx, cycleId: string, input: Items) {
  const items = itemsSchema.parse(input);
  const products = await tx.cycleProduct.findMany({
    where: { cycleId, id: { in: items.map(i => i.cycleProductId) }, isAvailable: true, product: { isActive: true } },
  });
  const map = new Map(products.map(p => [p.id, p]));
  const data = items.map(item => {
    const product = map.get(item.cycleProductId);
    if (!product) throw new ApiError(400, "A selected product is no longer available. Refresh the catalogue.");
    if (item.quantity > product.maxQtyPerPerson) throw new ApiError(400, "A quantity exceeds the limit for this product.");
    return { cycleProductId: product.id, quantity: item.quantity, unitPrice: product.price, lineTotal: product.price.mul(item.quantity) };
  });
  const totalAmount = data.reduce((sum, item) => sum.add(item.lineTotal), new Prisma.Decimal(0));
  return { data, totalAmount };
}
async function transaction<T>(action: (tx: Tx) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try { return await prisma.$transaction(action, { maxWait: 5000, timeout: 10000 }); }
    catch (error) {
      if (attempt < 2 && error instanceof Prisma.PrismaClientKnownRequestError && ["P2034", "P2028"].includes(error.code)) continue;
      throw error;
    }
  }
}
export async function createEmployeeOrder(employee: Employee, cycleId: string, items: Items) {
  return transaction(async tx => {
    const current = await validateEmployee(tx, employee);
    const cycle = await tx.orderCycle.findUnique({ where: { id: cycleId } });
    assertCycleOpen(cycle);
    const existing = await tx.order.findUnique({ where: { cycleId_employeeId: { cycleId, employeeId: current.employeeId } } });
    if (existing) throw new ApiError(409, "You already have an order for this cycle. Open My order to edit it.");
    const { data, totalAmount } = await calculateItems(tx, cycleId, items);
    const counter = await tx.orderCycle.update({ where: { id: cycleId }, data: { nextOrderNumber: { increment: 1 } } });
    const prefix = counter.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase() || "ORD";
    const orderNumber = prefix + "-" + String(counter.nextOrderNumber - 1).padStart(4, "0");
    return tx.order.create({
      data: { cycleId, employeeId: current.employeeId, employeeName: current.fullName, orderNumber, totalAmount, isAuthenticated: true, requiresSignature: false, items: { create: data } },
      include: { items: true },
    });
  });
}
export async function updateEmployeeOrder(employee: Employee, orderId: string, items: Items) {
  return transaction(async tx => {
    const current = await validateEmployee(tx, employee);
    const order = await tx.order.findFirst({ where: { id: orderId, employeeId: current.employeeId }, include: { cycle: true } });
    if (!order) throw new ApiError(404, "Order not found.");
    assertCycleOpen(order.cycle);
    if (order.status === "cancelled") throw new ApiError(409, "This order has been cancelled.");
    const { data, totalAmount } = await calculateItems(tx, order.cycleId, items);
    await tx.orderItem.deleteMany({ where: { orderId } });
    return tx.order.update({
      where: { id: orderId },
      data: { totalAmount, employeeName: current.fullName, status: "edited", isAuthenticated: true, requiresSignature: false, items: { create: data } },
      include: { items: true },
    });
  });
}
export const orderResult = (order: { id: string; orderNumber: string; totalAmount: Prisma.Decimal }) => ({
  id: order.id, orderNumber: order.orderNumber, totalAmount: order.totalAmount.toFixed(2),
});
