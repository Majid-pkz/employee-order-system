import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { requireAdmin } from "@/lib/access";
import { assertSameOrigin, apiError } from "@/lib/api";
import { employeeUpdateSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req); await requireAdmin();
    const { id } = await params;
    const { pin, ...data } = employeeUpdateSchema.parse(await req.json());
    const employee = await prisma.employee.update({
      where: { id },
      data: { ...data, ...(pin ? { pinHash: await hash(pin, 12) } : {}), sessionVersion: { increment: 1 } },
      select: { id: true, employeeId: true, fullName: true, isActive: true },
    });
    return NextResponse.json(employee);
  } catch (error) { return apiError(error); }
}
