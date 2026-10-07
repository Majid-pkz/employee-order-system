import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/access";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminOrderActions } from "@/components/admin/AdminOrderActions";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      cycle: true,
      items: {
        include: {
          cycleProduct: {
            include: { product: true },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to Orders
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
            <p className="text-gray-600 mt-1">{order.cycle.name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              ${Number(order.totalAmount).toFixed(2)}
            </p>
            <p className="text-sm capitalize text-gray-500">{order.status}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Employee</p>
            <p className="font-medium">{order.employeeName}</p>
            <p className="text-gray-500">ID: {order.employeeId}</p>
          </div>
          <div>
            <p className="text-gray-500">Authentication</p>
            {order.isAuthenticated ? (
              <p className="text-green-600 font-medium">Authenticated</p>
            ) : (
              <p className="text-orange-600 font-medium">Needs signature</p>
            )}
          </div>
          <div>
            <p className="text-gray-500">Submitted</p>
            <p>{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Last updated</p>
            <p>{new Date(order.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Items</h2>

        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2">Product</th>
              <th className="text-left px-4 py-2">Qty</th>
              <th className="text-left px-4 py-2">Unit Price</th>
              <th className="text-left px-4 py-2">Line Total</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3">
                  {item.cycleProduct.product.name}
                </td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">
                  ${Number(item.unitPrice).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  ${Number(item.lineTotal).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <AdminOrderActions
                    orderId={order.id}
                    itemId={item.id}
                    cycleStatus={order.cycle.status}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}