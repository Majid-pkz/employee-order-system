import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/access";
import { assertSameOrigin, apiError } from "@/lib/api";
import { cycleSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
export async function POST(req: Request) {
  try {
    assertSameOrigin(req); await requireAdmin();
    const data = cycleSchema.parse(await req.json());
    return NextResponse.json(await prisma.orderCycle.create({ data: { name: data.name, deadline: data.deadline ? new Date(data.deadline) : null, status: "draft" } }), { status: 201 });
  } catch (error) { return apiError(error); }
}
