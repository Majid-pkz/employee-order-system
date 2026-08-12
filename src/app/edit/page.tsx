import { prisma } from "@/lib/prisma";
import { EditOrderForm } from "@/components/order/EditOrderForm";
import Link from "next/link";
import { PublicHeader } from "@/components/order/PublicHeader";

export default async function EditOrderPage() {
  // Find the currently open cycle
  const openCycle = await prisma.orderCycle.findFirst({
    where: { status: "open" },
    include: {
      cycleProducts: {
        where: { isAvailable: true },
        include: {
          product: true,
        },
        orderBy: {
          product: { name: "asc" },
        },
      },
    },
  });

  if (!openCycle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-10 rounded-lg shadow text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Orders are currently closed</h1>
          <p className="text-gray-600 mb-6">
            There is no open order cycle at the moment.
          </p>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
    <PublicHeader title={`Edit order – ${openCycle.name}`} />
    <div className="max-w-3xl mx-auto px-4 pb-10">
      <EditOrderForm
        cycleId={openCycle.id}
        products={openCycle.cycleProducts.map((cp) => ({
          cycleProductId: cp.id,
          name: cp.product.name,
          description: cp.product.description,
          price: Number(cp.price),
          maxQty: cp.maxQtyPerPerson,
          imagePath: cp.product.imagePath,
        }))}
      />
    </div>
  </div>
  );
}