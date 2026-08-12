import { prisma } from "@/lib/prisma";
import { OrderForm } from "@/components/order/OrderForm";
import Link from "next/link";
import { PublicHeader } from "@/components/order/PublicHeader";

export default async function HomePage() {
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
  <div className="min-h-screen bg-gray-100">
    <PublicHeader />
    <div className="flex items-center justify-center px-4 py-16">
      <div className="bg-white p-10 rounded-lg shadow text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">Orders are currently closed</h1>
        <p className="text-gray-600">
          There is no open order cycle at the moment. Please check back later.
        </p>
      </div>
    </div>
  </div>
);
  }

  return (
   <div className="min-h-screen bg-gray-100">
    <PublicHeader title={openCycle.name} />
    <div className="max-w-3xl mx-auto px-4 pb-10">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold">{openCycle.name}</h1>
        {openCycle.deadline && (
          <p className="text-gray-600 mt-1">
            Order deadline: {new Date(openCycle.deadline).toLocaleString()}
          </p>
        )}
      </div>

        <OrderForm
          cycleId={openCycle.id}
        cycleName={openCycle.name}
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