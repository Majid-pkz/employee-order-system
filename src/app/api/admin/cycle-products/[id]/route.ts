import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: cycleProductId } = await params;

  try {
    // 1. Find all order items that use this cycle product
    const affectedItems = await prisma.orderItem.findMany({
      where: { cycleProductId },
      select: { orderId: true },
    });

    // Unique list of affected order IDs
    const affectedOrderIds = [
      ...new Set(affectedItems.map((item) => item.orderId)),
    ];

    // 2. Do everything in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all order items that reference this cycle product
      await tx.orderItem.deleteMany({
        where: { cycleProductId },
      });

      // Delete the cycle product itself
      await tx.cycleProduct.delete({
        where: { id: cycleProductId },
      });

      // Recalculate total for every affected order
      for (const orderId of affectedOrderIds) {
        const remainingItems = await tx.orderItem.findMany({
          where: { orderId },
        });

        const newTotal = remainingItems.reduce(
          (sum, item) => sum + Number(item.lineTotal),
          0
        );

        await tx.order.update({
          where: { id: orderId },
          data: {
            totalAmount: newTotal,
            status: "edited",
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      affectedOrders: affectedOrderIds.length,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to remove product from cycle" },
      { status: 500 }
    );
  }
}