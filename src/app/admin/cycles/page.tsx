import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CyclesPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const cycles = await prisma.orderCycle.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Order Cycles</h1>
        <Link
          href="/admin/cycles/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Create Cycle
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-6 py-3">Name</th>
              <th className="text-left px-6 py-3">Deadline</th>
              <th className="text-left px-6 py-3">Status</th>
              <th className="text-left px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cycles.map((cycle) => (
              <tr key={cycle.id} className="border-t">
                <td className="px-6 py-4 font-medium">{cycle.name}</td>
                <td className="px-6 py-4">
                  {cycle.deadline
                    ? new Date(cycle.deadline).toLocaleString()
                    : "—"}
                </td>
                <td className="px-6 py-4">
                  {cycle.status === "open" && (
                    <span className="text-green-600 font-medium">Open</span>
                  )}
                  {cycle.status === "draft" && (
                    <span className="text-yellow-600 font-medium">Draft</span>
                  )}
                  {cycle.status === "closed" && (
                    <span className="text-gray-500 font-medium">Closed</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/cycles/${cycle.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
            {cycles.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No order cycles yet.
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