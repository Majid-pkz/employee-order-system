import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";


export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const [employeeCount, productCount, openCycle, orderCount] =
    await Promise.all([
      prisma.employee.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.orderCycle.findFirst({ where: { status: "open" } }),
      prisma.order.count(),
    ]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Welcome, <strong>{session.user?.name}</strong>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Active Employees</p>
          <p className="text-2xl font-bold">{employeeCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Active Products</p>
          <p className="text-2xl font-bold">{productCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Open Cycle</p>
          <p className="text-2xl font-bold">
            {openCycle ? openCycle.name : "None"}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold">{orderCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/admin/employees"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold mb-2">Employees</h2>
          <p className="text-gray-600 text-sm">
            Manage employee list and PINs
          </p>
        </Link>

        <Link
          href="/admin/products"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold mb-2">Products</h2>
          <p className="text-gray-600 text-sm">Master product catalogue</p>
        </Link>

        <Link
          href="/admin/cycles"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold mb-2">Order Cycles</h2>
          <p className="text-gray-600 text-sm">
            Create and manage monthly cycles
          </p>
        </Link>

        <Link
          href="/admin/orders"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold mb-2">Orders</h2>
          <p className="text-gray-600 text-sm">
            View orders and export PDFs
          </p>
        </Link>
      </div>
    </div>
  );
}