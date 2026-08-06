import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cycleId, employeeId, pin } = body;

    if (!cycleId || !employeeId) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      );
    }

    // Check cycle is still open
    const cycle = await prisma.orderCycle.findUnique({
      where: { id: cycleId },
    });

    if (!cycle || cycle.status !== "open") {
      return NextResponse.json(
        { error: "This order cycle is closed. You can no longer edit orders." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        cycleId_employeeId: {
          cycleId,
          employeeId: employeeId.trim(),
        },
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "No order found for this Employee ID in the current cycle." },
        { status: 404 }
      );
    }

    // Optional: if the order was authenticated, require PIN again for extra safety
    if (order.isAuthenticated) {
      const employee = await prisma.employee.findUnique({
        where: { employeeId: employeeId.trim() },
      });

      if (employee?.pinHash) {
        if (!pin) {
          return NextResponse.json(
            { error: "This order was authenticated. Please enter your PIN to edit it." },
            { status: 400 }
          );
        }

        const pinValid = await compare(pin, employee.pinHash);
        if (!pinValid) {
          return NextResponse.json(
            { error: "Incorrect PIN" },
            { status: 400 }
          );
        }
      }
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      employeeName: order.employeeName,
      items: order.items.map((item) => ({
        cycleProductId: item.cycleProductId,
        quantity: item.quantity,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to look up order" },
      { status: 500 }
    );
  }
}