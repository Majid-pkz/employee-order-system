import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ orderId: string; itemId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId, itemId } = await params;

  try {
    // Make sure the item belongs to this order
    const item = await prisma.orderItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.orderId !== orderId) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Delete the item and recalculate the order total
    await prisma.$transaction(async (tx) => {
      await tx.orderItem.delete({
        where: { id: itemId },
      });

      const remainingItems = await tx.orderItem.findMany({
        where: { orderId },
      });

      const newTotal = remainingItems.reduce(
        (sum, i) => sum + Number(i.lineTotal),
        0
      );

      await tx.order.update({
        where: { id: orderId },
        data: {
          totalAmount: newTotal,
          status: "edited",
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to remove item" },
      { status: 500 }
    );
  }
}