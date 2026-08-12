import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export default async function ProductsPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Product
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-6 py-3">Image</th>
              <th className="text-left px-6 py-3">Name</th>
              <th className="text-left px-6 py-3">Market Price</th>
              <th className="text-left px-6 py-3">Discounted Price</th>
              <th className="text-left px-6 py-3">Status</th>
              <th className="text-left px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t">
                <td className="px-6 py-4">
                  {product.imagePath ? (
                    <img
                      src={product.imagePath}
                      alt={product.name}
                      width={60}
                      height={60}
                      className="rounded object-cover"
                      style={{ width: 60, height: 60 }}
                    />
                  ) : (
                    <div className="w-[60px] h-[60px] bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                      No image
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 font-medium">{product.name}</td>
                <td className="px-6 py-4">
                  ${Number(product.marketPrice).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  ${Number(product.discountedPrice).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  {product.isActive ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-red-600">Inactive</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteProductButton productId={product.id} />
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No products yet. Click “Add Product” to create one.
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