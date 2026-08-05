import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, deadline } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Cycle name is required" },
        { status: 400 }
      );
    }

    // Optional: prevent creating a new cycle if one is already open
    const openCycle = await prisma.orderCycle.findFirst({
      where: { status: "open" },
    });

    if (openCycle) {
      return NextResponse.json(
        { error: "There is already an open cycle. Close it before creating a new one." },
        { status: 400 }
      );
    }

    const cycle = await prisma.orderCycle.create({
      data: {
        name,
        deadline: deadline ? new Date(deadline) : null,
        status: "draft",
      },
    });

    return NextResponse.json(cycle, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create cycle" },
      { status: 500 }
    );
  }
}