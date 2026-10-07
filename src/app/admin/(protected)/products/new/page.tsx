import { requireAdminPage } from "@/lib/access";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  await requireAdminPage();

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">Add Product</h1>
      <ProductForm />
    </div>
  );
}