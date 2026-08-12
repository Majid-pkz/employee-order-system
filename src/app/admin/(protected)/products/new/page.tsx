import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">Add Product</h1>
      <ProductForm />
    </div>
  );
}