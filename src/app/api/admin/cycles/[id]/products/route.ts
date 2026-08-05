import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: cycleId } = await params;

  try {
    const body = await req.json();
    const { productId, price, maxQtyPerPerson } = body;

    if (!productId || price === undefined || !maxQtyPerPerson) {
      return NextResponse.json(
        { error: "Product, price and max quantity are required" },
        { status: 400 }
      );
    }

    // Prevent adding the same product twice
    const existing = await prisma.cycleProduct.findUnique({
      where: {
        cycleId_productId: {
          cycleId,
          productId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This product is already in the cycle" },
        { status: 400 }
      );
    }

    const cycleProduct = await prisma.cycleProduct.create({
      data: {
        cycleId,
        productId,
        price,
        maxQtyPerPerson,
      },
    });

    return NextResponse.json(cycleProduct, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to add product to cycle" },
      { status: 500 }
    );
  }
}