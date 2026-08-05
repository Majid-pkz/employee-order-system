import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId");
  const name = searchParams.get("name");

  if (!employeeId && !name) {
    return NextResponse.json({ matches: [] });
  }

  // Exact match by Employee ID
  if (employeeId) {
    const employee = await prisma.employee.findFirst({
      where: {
        employeeId: employeeId.trim(),
        isActive: true,
      },
    });

    if (!employee) {
      return NextResponse.json({ matches: [] });
    }

    return NextResponse.json({
      matches: [
        {
          employeeId: employee.employeeId,
          fullName: employee.fullName,
          hasPin: !!employee.pinHash,
        },
      ],
    });
  }

  // Partial, case-insensitive name search → can return multiple
  if (name) {
    const employees = await prisma.employee.findMany({
      where: {
        fullName: {
          contains: name.trim(),
        },
        isActive: true,
      },
      orderBy: { fullName: "asc" },
      take: 10, // safety limit
    });

    return NextResponse.json({
      matches: employees.map((e) => ({
        employeeId: e.employeeId,
        fullName: e.fullName,
        hasPin: !!e.pinHash,
      })),
    });
  }

  return NextResponse.json({ matches: [] });
}