import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params;

  try {
    const body = await req.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items are required" },
        { status: 400 }
      );
    }

    // Load the order and check the cycle is still open
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { cycle: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.cycle.status !== "open") {
      return NextResponse.json(
        { error: "This order cycle is closed. You can no longer edit orders." },
        { status: 400 }
      );
    }

    // Validate new items
    const cycleProducts = await prisma.cycleProduct.findMany({
      where: {
        cycleId: order.cycleId,
        id: { in: items.map((i: any) => i.cycleProductId) },
        isAvailable: true,
      },
    });

    const cycleProductMap = new Map(
      cycleProducts.map((cp) => [cp.id, cp])
    );

    let totalAmount = 0;
    const orderItemsData: {
      cycleProductId: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }[] = [];

    for (const item of items) {
      const cp = cycleProductMap.get(item.cycleProductId);
      if (!cp) continue;

      if (item.quantity > cp.maxQtyPerPerson) {
        return NextResponse.json(
          { error: "Quantity exceeds maximum allowed for a product" },
          { status: 400 }
        );
      }

      if (item.quantity <= 0) continue;

      const unitPrice = Number(cp.price);
      const lineTotal = unitPrice * item.quantity;
      totalAmount += lineTotal;

      orderItemsData.push({
        cycleProductId: cp.id,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      });
    }

    if (orderItemsData.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one product" },
        { status: 400 }
      );
    }

    // Update in a transaction: delete old items, create new ones, update total
    const updatedOrder = await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({
        where: { orderId },
      });

      await tx.orderItem.createMany({
        data: orderItemsData.map((item) => ({
          orderId,
          ...item,
        })),
      });

      return tx.order.update({
        where: { id: orderId },
        data: {
          totalAmount,
          status: "edited",
        },
      });
    });

    return NextResponse.json({
      orderNumber: updatedOrder.orderNumber,
      totalAmount: updatedOrder.totalAmount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}