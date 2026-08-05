import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { CycleStatusButtons } from "@/components/admin/CycleStatusButtons";
import { AddProductToCycle } from "@/components/admin/AddProductToCycle";
import { RemoveCycleProductButton } from "@/components/admin/RemoveCycleProductButton";

export default async function ManageCyclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const { id } = await params;

  const cycle = await prisma.orderCycle.findUnique({
    where: { id },
    include: {
      cycleProducts: {
        include: {
          product: true,
        },
        orderBy: {
          product: { name: "asc" },
        },
      },
    },
  });

  if (!cycle) {
    notFound();
  }

  // Products that are not yet in this cycle
  const availableProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      id: {
        notIn: cycle.cycleProducts.map((cp) => cp.productId),
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{cycle.name}</h1>
          <p className="text-gray-600 mt-1">
            Status:{" "}
            <span className="font-medium capitalize">{cycle.status}</span>
          </p>
          {cycle.deadline && (
            <p className="text-gray-600">
              Deadline: {new Date(cycle.deadline).toLocaleString()}
            </p>
          )}
        </div>

        <CycleStatusButtons cycleId={cycle.id} currentStatus={cycle.status} />
      </div>

      {/* Products currently in the cycle */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Products in this cycle ({cycle.cycleProducts.length})
        </h2>

        {cycle.cycleProducts.length === 0 ? (
          <p className="text-gray-500">No products added yet.</p>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2">Product</th>
                <th className="text-left px-4 py-2">Price</th>
                <th className="text-left px-4 py-2">Max Qty / Person</th>
                <th className="text-left px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cycle.cycleProducts.map((cp) => (
                <tr key={cp.id} className="border-t">
                  <td className="px-4 py-3">{cp.product.name}</td>
                  <td className="px-4 py-3">
                    ${Number(cp.price).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">{cp.maxQtyPerPerson}</td>
                  <td className="px-4 py-3">
                    <RemoveCycleProductButton cycleProductId={cp.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add products to cycle */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Add Product to Cycle</h2>

        {availableProducts.length === 0 ? (
          <p className="text-gray-500">
            All active products have already been added to this cycle.
          </p>
        ) : (
          <AddProductToCycle
            cycleId={cycle.id}
            products={availableProducts.map((p) => ({
              id: p.id,
              name: p.name,
              discountedPrice: Number(p.discountedPrice),
            }))}
          />
        )}
      </div>

      <div className="mt-8">
        <Link href="/admin/cycles" className="text-blue-600 hover:underline">
          ← Back to Cycles
        </Link>
      </div>
    </div>
  );
}