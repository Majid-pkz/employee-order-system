import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/access";
import { assertSameOrigin, apiError, ApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
export async function DELETE(req: Request, { params }: { params: Promise<{ orderId: string; itemId: string }> }) {
  try {
    assertSameOrigin(req); await requireAdmin();
    const { orderId, itemId } = await params;
    await prisma.$transaction(async tx => {
      const item = await tx.orderItem.findFirst({ where: { id: itemId, orderId } });
      if (!item) throw new ApiError(404, "Order item not found.");
      await tx.orderItem.delete({ where: { id: itemId } });
      const remaining = await tx.orderItem.findMany({ where: { orderId } });
      const totalAmount = remaining.reduce((sum, i) => sum.add(i.lineTotal), new Prisma.Decimal(0));
      await tx.order.update({ where: { id: orderId }, data: { totalAmount, status: remaining.length ? "edited" : "cancelled" } });
    });
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}
