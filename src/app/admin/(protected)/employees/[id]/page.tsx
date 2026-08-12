import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { EmployeeForm } from "@/components/admin/EmployeeForm";

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const { id } = await params;

  const employee = await prisma.employee.findUnique({
    where: { id },
  });

  if (!employee) {
    notFound();
  }

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">Edit Employee</h1>

      <EmployeeForm
        initialData={{
          id: employee.id,
          employeeId: employee.employeeId,
          fullName: employee.fullName,
          isActive: employee.isActive,
          hasPin: !!employee.pinHash,
        }}
      />
    </div>
  );
}