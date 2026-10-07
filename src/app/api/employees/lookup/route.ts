import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/access";
import { apiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
export async function GET(req: Request) {
  try {
    await requireAdmin();
    const query = new URL(req.url).searchParams;
    const employeeId = query.get("employeeId")?.trim();
    const name = query.get("name")?.trim();
    if (!employeeId && (!name || name.length < 2)) return NextResponse.json({ matches: [] });
    const employees = await prisma.employee.findMany({
      where: { isActive: true, ...(employeeId ? { employeeId } : { fullName: { contains: name } }) },
      select: { employeeId: true, fullName: true, pinHash: true }, take: 10, orderBy: { fullName: "asc" },
    });
    return NextResponse.json({ matches: employees.map(e => ({ employeeId: e.employeeId, fullName: e.fullName, hasPin: !!e.pinHash })) });
  } catch (error) { return apiError(error); }
}
