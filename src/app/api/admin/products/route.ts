import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/access";
import { assertSameOrigin, apiError } from "@/lib/api";
import { productSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
export async function POST(req: Request) {
  try {
    assertSameOrigin(req); await requireAdmin();
    const data = productSchema.parse(await req.json());
    return NextResponse.json(await prisma.product.create({ data }), { status: 201 });
  } catch (error) { return apiError(error); }
}
