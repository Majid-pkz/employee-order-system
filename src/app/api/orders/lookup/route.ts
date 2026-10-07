import { NextResponse } from "next/server";
import { z } from "zod";
import { requireEmployee } from "@/lib/access";
import { assertSameOrigin, apiError, ApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const employee = await requireEmployee();
    const { cycleId } = z.object({ cycleId: z.string().min(1).max(80) }).strict().parse(await req.json());
    const order = await prisma.order.findUnique({ where: { cycleId_employeeId: { cycleId, employeeId: employee.employeeId } }, include: { items: true } });
    if (!order) throw new ApiError(404, "You do not have an order for this cycle yet.");
    return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber, totalAmount: order.totalAmount.toFixed(2), items: order.items.map(i => ({ cycleProductId: i.cycleProductId, quantity: i.quantity })) });
  } catch (error) { return apiError(error); }
}
