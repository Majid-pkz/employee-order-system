import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/access";
import { assertSameOrigin, apiError, ApiError } from "@/lib/api";
import { cycleUpdateSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req); await requireAdmin();
    const { id } = await params;
    const data = cycleUpdateSchema.parse(await req.json());
    const cycle = await prisma.$transaction(async tx => {
      const current = await tx.orderCycle.findUnique({ where: { id } });
      if (!current) throw new ApiError(404, "Cycle not found.");
      if (data.status === "open") {
        const deadline = data.deadline === undefined ? current.deadline : data.deadline ? new Date(data.deadline) : null;
        if (deadline && deadline <= new Date()) throw new ApiError(400, "Set a future deadline before opening this cycle.");
        const other = await tx.orderCycle.findFirst({ where: { status: "open", id: { not: id } } });
        if (other) throw new ApiError(409, "Close the existing open cycle first.");
        if (!await tx.cycleProduct.count({ where: { cycleId: id, isAvailable: true, product: { isActive: true } } })) throw new ApiError(400, "Add at least one active product before opening this cycle.");
      }
      return tx.orderCycle.update({ where: { id }, data: { ...data, ...(data.deadline !== undefined ? { deadline: data.deadline ? new Date(data.deadline) : null } : {}) } });
    });
    return NextResponse.json(cycle);
  } catch (error) { return apiError(error); }
}
