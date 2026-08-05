import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const { name, deadline, status } = body;

    // If trying to open this cycle, make sure no other cycle is open
    if (status === "open") {
      const otherOpen = await prisma.orderCycle.findFirst({
        where: {
          status: "open",
          id: { not: id },
        },
      });

      if (otherOpen) {
        return NextResponse.json(
          { error: "Another cycle is already open. Close it first." },
          { status: 400 }
        );
      }
    }

    const data: {
      name?: string;
      deadline?: Date | null;
      status?: string;
    } = {};

    if (name !== undefined) data.name = name;
    if (deadline !== undefined) {
      data.deadline = deadline ? new Date(deadline) : null;
    }
    if (status !== undefined) data.status = status;

    const cycle = await prisma.orderCycle.update({
      where: { id },
      data,
    });

    return NextResponse.json(cycle);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update cycle" },
      { status: 500 }
    );
  }
}