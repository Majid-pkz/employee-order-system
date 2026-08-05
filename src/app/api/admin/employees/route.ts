import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { employeeId, fullName, pin, isActive } = body;

    if (!employeeId || !fullName) {
      return NextResponse.json(
        { error: "Employee ID and Full Name are required" },
        { status: 400 }
      );
    }

    // Check if employeeId already exists
    const existing = await prisma.employee.findUnique({
      where: { employeeId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Employee ID already exists" },
        { status: 400 }
      );
    }

    const pinHash = pin ? await hash(pin, 12) : null;

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        fullName,
        pinHash,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}