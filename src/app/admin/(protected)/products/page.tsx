import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/access";
import { productImage } from "@/lib/catalog";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
export default async function ProductsPage() {
  await requireAdminPage();
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
  return <div><div className="admin-heading"><div><span className="eyebrow">THE MASTER SELECTION</span><h1>Product catalogue</h1><p>Everyday favourites, ready for the next sales cycle.</p></div><Link href="/admin/products/new" className="button button-primary"><Plus size={15} /> Add product</Link></div><div className="admin-table-wrap"><table><thead><tr><th>Product</th><th>Category</th><th>Regular price</th><th>Staff price</th><th>Status</th><th>Actions</th></tr></thead><tbody>{products.map(product => { const image = productImage(product.imagePath, product.name); return <tr key={product.id}><td><div className="flex gap-3 items-center">{image && <Image className="admin-product-thumb" src={image} alt="" width={50} height={50} />}<div><strong>{product.name}</strong><p className="muted">{product.unit}</p></div></div></td><td>{product.category}</td><td>${Number(product.marketPrice).toFixed(2)}</td><td>${Number(product.discountedPrice).toFixed(2)}</td><td><span className="status-pill">{product.isActive ? "Active" : "Inactive"}</span></td><td><div className="flex gap-4 items-center"><Link href={"/admin/products/" + product.id} className="text-button">Edit</Link><DeleteProductButton productId={product.id} /></div></td></tr>; })}{!products.length && <tr><td colSpan={6}>Your catalogue is empty. Add a product to get started.</td></tr>}</tbody></table></div></div>;
}
