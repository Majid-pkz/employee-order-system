import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/access";
import { assertSameOrigin, apiError, ApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req); await requireAdmin();
    const { id: cycleProductId } = await params;
    const affectedOrders = await prisma.$transaction(async tx => {
      const product = await tx.cycleProduct.findUnique({ where: { id: cycleProductId } });
      if (!product) throw new ApiError(404, "Product not found in this cycle.");
      const items = await tx.orderItem.findMany({ where: { cycleProductId }, select: { orderId: true } });
      const ids = [...new Set(items.map(i => i.orderId))];
      await tx.orderItem.deleteMany({ where: { cycleProductId } });
      await tx.cycleProduct.delete({ where: { id: cycleProductId } });
      for (const orderId of ids) {
        const remaining = await tx.orderItem.findMany({ where: { orderId } });
        const totalAmount = remaining.reduce((sum, i) => sum.add(i.lineTotal), new Prisma.Decimal(0));
        await tx.order.update({ where: { id: orderId }, data: { totalAmount, status: remaining.length ? "edited" : "cancelled" } });
      }
      return ids.length;
    });
    return NextResponse.json({ success: true, affectedOrders });
  } catch (error) { return apiError(error); }
}
