import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { fullName, pin, isActive } = body;

    if (!fullName) {
      return NextResponse.json(
        { error: "Full Name is required" },
        { status: 400 }
      );
    }

    const data: {
      fullName: string;
      isActive: boolean;
      pinHash?: string;
    } = {
      fullName,
      isActive: isActive ?? true,
    };

    // Only update PIN if a new one was provided
    if (pin) {
      data.pinHash = await hash(pin, 12);
    }

    const employee = await prisma.employee.update({
      where: { id },
      data,
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}