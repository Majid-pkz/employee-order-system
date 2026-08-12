import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function AdminNav() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <nav className="bg-slate-800 text-white px-6 py-3">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-5">
          <Link
            href="/admin"
            className="font-semibold text-lg hover:text-blue-300"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/employees"
            className="text-sm hover:text-blue-300"
          >
            Employees
          </Link>
          <Link
            href="/admin/products"
            className="text-sm hover:text-blue-300"
          >
            Products
          </Link>
          <Link
            href="/admin/cycles"
            className="text-sm hover:text-blue-300"
          >
            Cycles
          </Link>
          <Link
            href="/admin/orders"
            className="text-sm hover:text-blue-300"
          >
            Orders
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300">
            {session.user?.name}
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button
              type="submit"
              className="text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}