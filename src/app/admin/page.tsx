import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
        >
          <button
            type="submit"
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </form>
      </div>

      <p className="mb-6 text-lg">
        Welcome, <strong>{session.user?.name}</strong>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/employees"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold mb-2">Employees</h2>
          <p className="text-gray-600">Manage employee list and PINs</p>
        </Link>

        <Link
          href="/admin/products"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold mb-2">Products</h2>
          <p className="text-gray-600">Master product list</p>
        </Link>

        <Link
          href="/admin/cycles"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold mb-2">Order Cycles</h2>
          <p className="text-gray-600">Create and manage monthly cycles</p>
        </Link>
        <Link
          href="/admin/orders"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold mb-2">Orders</h2>
          <p className="text-gray-600">View and manage submitted orders</p>
        </Link>
      </div>
    </div>
  );
}
