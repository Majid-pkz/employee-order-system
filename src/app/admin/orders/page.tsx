import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  // Get the current open cycle (or the most recent one)
  const cycle = await prisma.orderCycle.findFirst({
    where: {
      OR: [{ status: "open" }, { status: "closed" }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      orders: {
        include: {
          items: {
            include: {
              cycleProduct: {
                include: { product: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      cycleProducts: {
        include: { product: true },
      },
    },
  });

  if (!cycle) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Orders</h1>
        <p className="text-gray-600">No order cycles found.</p>
        <Link href="/admin" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const totalValue = cycle.orders.reduce(
    (sum, order) => sum + Number(order.totalAmount),
    0
  );

  // Product totals
  const productTotals = new Map<
    string,
    { name: string; quantity: number; value: number }
  >();

  for (const order of cycle.orders) {
    for (const item of order.items) {
      const key = item.cycleProductId;
      const existing = productTotals.get(key) || {
        name: item.cycleProduct.product.name,
        quantity: 0,
        value: 0,
      };
      existing.quantity += item.quantity;
      existing.value += Number(item.lineTotal);
      productTotals.set(key, existing);
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-gray-600">
            {cycle.name}{" "}
            <span className="capitalize">({cycle.status})</span>
          </p>
        </div>
        <Link
          href="/admin"
          className="text-blue-600 hover:underline"
        >
          ← Dashboard
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold">{cycle.orders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Total Value</p>
          <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Needs Signature</p>
          <p className="text-2xl font-bold">
            {cycle.orders.filter((o) => o.requiresSignature).length}
          </p>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-10">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-6 py-3">Order #</th>
              <th className="text-left px-6 py-3">Employee</th>
              <th className="text-left px-6 py-3">Total</th>
              <th className="text-left px-6 py-3">Auth</th>
              <th className="text-left px-6 py-3">Status</th>
              <th className="text-left px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cycle.orders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
                <td className="px-6 py-4">
                  <div>{order.employeeName}</div>
                  <div className="text-sm text-gray-500">
                    ID: {order.employeeId}
                  </div>
                </td>
                <td className="px-6 py-4">
                  ${Number(order.totalAmount).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  {order.isAuthenticated ? (
                    <span className="text-green-600 text-sm">Authenticated</span>
                  ) : (
                    <span className="text-orange-600 text-sm">Needs signature</span>
                  )}
                </td>
                <td className="px-6 py-4 capitalize text-sm">
                  {order.status}
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {cycle.orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No orders yet in this cycle.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Product totals */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Product Totals</h2>
        {productTotals.size === 0 ? (
          <p className="text-gray-500">No products ordered yet.</p>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2">Product</th>
                <th className="text-left px-4 py-2">Total Qty</th>
                <th className="text-left px-4 py-2">Total Value</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(productTotals.values()).map((p) => (
                <tr key={p.name} className="border-t">
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">{p.quantity}</td>
                  <td className="px-4 py-3">${p.value.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}