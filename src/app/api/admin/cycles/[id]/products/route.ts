import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/access";
import { assertSameOrigin, apiError, ApiError } from "@/lib/api";
import { cycleProductSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req); await requireAdmin();
    const { id: cycleId } = await params;
    const data = cycleProductSchema.parse(await req.json());
    const product = await prisma.product.findFirst({ where: { id: data.productId, isActive: true } });
    if (!product) throw new ApiError(400, "Choose an active product.");
    return NextResponse.json(await prisma.cycleProduct.create({ data: { ...data, cycleId } }), { status: 201 });
  } catch (error) { return apiError(error); }
}
