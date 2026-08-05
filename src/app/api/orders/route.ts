import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cycleId, employeeId, employeeName, pin, items } = body;

    if (!cycleId || !employeeId || !employeeName || !items?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Check that the cycle is open
    const cycle = await prisma.orderCycle.findUnique({
      where: { id: cycleId },
    });

    if (!cycle || cycle.status !== "open") {
      return NextResponse.json(
        { error: "This order cycle is not open" },
        { status: 400 }
      );
    }

    // 2. Prevent second order for the same employee in this cycle
    const existingOrder = await prisma.order.findUnique({
      where: {
        cycleId_employeeId: {
          cycleId,
          employeeId: employeeId.trim(),
        },
      },
    });

    if (existingOrder) {
      return NextResponse.json(
        { error: "You have already placed an order in this cycle. Use Edit Order instead." },
        { status: 400 }
      );
    }

    // 3. Check PIN (if provided)
    let isAuthenticated = false;
    let requiresSignature = true;

    const employee = await prisma.employee.findUnique({
      where: { employeeId: employeeId.trim() },
    });

    if (employee && employee.pinHash && pin) {
      const pinValid = await compare(pin, employee.pinHash);
      if (pinValid) {
        isAuthenticated = true;
        requiresSignature = false;
      }
    }

    // 4. Validate items and calculate totals
    const cycleProducts = await prisma.cycleProduct.findMany({
      where: {
        cycleId,
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
      if (!cp) {
        return NextResponse.json(
          { error: "One of the selected products is not available" },
          { status: 400 }
        );
      }

      if (item.quantity > cp.maxQtyPerPerson) {
        return NextResponse.json(
          { error: `Quantity for a product exceeds the maximum allowed` },
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

    // 5. Generate order number (e.g. AUG-0042)
    const orderCount = await prisma.order.count({
      where: { cycleId },
    });

    const prefix = cycle.name.replace(/\s+/g, "").slice(0, 3).toUpperCase();
    const orderNumber = `${prefix}-${String(orderCount + 1).padStart(4, "0")}`;

    // 6. Create the order
    const order = await prisma.order.create({
      data: {
        cycleId,
        employeeId: employeeId.trim(),
        employeeName: employeeName.trim(),
        orderNumber,
        totalAmount,
        isAuthenticated,
        requiresSignature,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      isAuthenticated: order.isAuthenticated,
      requiresSignature: order.requiresSignature,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to submit order" },
      { status: 500 }
    );
  }
}