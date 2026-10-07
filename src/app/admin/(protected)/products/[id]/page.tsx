import { requireAdminPage } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>

      <ProductForm
        initialData={{
          id: product.id,
          name: product.name,
          description: product.description,
          marketPrice: Number(product.marketPrice),
          discountedPrice: Number(product.discountedPrice),
          imagePath: product.imagePath,
          category: product.category,
          unit: product.unit,
          isActive: product.isActive,
        }}
      />
    </div>
  );
}