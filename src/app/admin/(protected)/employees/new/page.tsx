import { requireAdminPage } from "@/lib/access";
import { EmployeeForm } from "@/components/admin/EmployeeForm";

export default async function NewEmployeePage() {
  await requireAdminPage();

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">Add Employee</h1>
      <EmployeeForm />
    </div>
  );
}

