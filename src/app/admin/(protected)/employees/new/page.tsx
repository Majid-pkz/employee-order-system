import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EmployeeForm } from "@/components/admin/EmployeeForm";

export default async function NewEmployeePage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">Add Employee</h1>
      <EmployeeForm />
    </div>
  );
}

