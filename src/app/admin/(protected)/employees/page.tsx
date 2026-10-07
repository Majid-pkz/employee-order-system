import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { requireAdminPage } from "@/lib/access";

export default async function EmployeesPage() {
  await requireAdminPage();

  const employees = await prisma.employee.findMany({
    orderBy: { employeeId: "asc" },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employees</h1>
        <Link
          href="/admin/employees/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Employee
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-6 py-3">Employee ID</th>
              <th className="text-left px-6 py-3">Name</th>
              <th className="text-left px-6 py-3">PIN Set</th>
              <th className="text-left px-6 py-3">Status</th>
              <th className="text-left px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-t">
                <td className="px-6 py-4 font-medium">{emp.employeeId}</td>
                <td className="px-6 py-4">{emp.fullName}</td>
                <td className="px-6 py-4">
                  {emp.pinHash ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-gray-400">No</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {emp.isActive ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-red-600">Inactive</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/employees/${emp.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No employees yet. Click “Add Employee” to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Link href="/admin" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}