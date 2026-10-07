import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { requireAdmin } from "@/lib/access";
import { assertSameOrigin, apiError } from "@/lib/api";
import { employeeSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
export async function POST(req: Request) {
  try {
    assertSameOrigin(req); await requireAdmin();
    const { pin, ...data } = employeeSchema.parse(await req.json());
    const employee = await prisma.employee.create({ data: { ...data, pinHash: await hash(pin, 12) }, select: { id: true, employeeId: true, fullName: true, isActive: true } });
    return NextResponse.json(employee, { status: 201 });
  } catch (error) { return apiError(error); }
}
