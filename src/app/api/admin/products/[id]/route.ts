import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/access";
import { assertSameOrigin, apiError, ApiError } from "@/lib/api";
import { productSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req); await requireAdmin();
    const { id } = await params;
    return NextResponse.json(await prisma.product.update({ where: { id }, data: productSchema.parse(await req.json()) }));
  } catch (error) { return apiError(error); }
}
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req); await requireAdmin();
    const { id } = await params;
    if (await prisma.cycleProduct.count({ where: { productId: id } })) throw new ApiError(409, "This product belongs to a sales cycle. Make it inactive to preserve order history.");
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}
