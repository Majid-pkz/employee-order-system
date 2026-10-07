"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
type Product = { id: string; name: string; discountedPrice: number };
export function AddProductToCycle({ cycleId, products }: { cycleId: string; products: Product[] }) {
  const router = useRouter();
  const [productId, setProductId] = useState(products[0]?.id || "");
  const [price, setPrice] = useState(products[0]?.discountedPrice.toString() || "");
  const [maxQty, setMaxQty] = useState("3");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/cycles/" + cycleId + "/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, price: Number(price), maxQtyPerPerson: Number(maxQty) }) });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "We could not add this product."); return; }
      router.refresh();
    } catch { setError("We could not connect. Please try again."); }
    finally { setLoading(false); }
  }
  return <form className="max-w-md" onSubmit={submit}><div className="field"><label htmlFor="cycle-product">Product</label><select id="cycle-product" value={productId} onChange={e => { setProductId(e.target.value); setPrice(products.find(p => p.id === e.target.value)?.discountedPrice.toString() || ""); }} required>{products.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}</select></div><div className="admin-form-grid"><div className="field"><label htmlFor="cycle-price">Price in this cycle (AUD)</label><input id="cycle-price" type="number" value={price} onChange={e => setPrice(e.target.value)} min="0" max="10000" step="0.01" required /></div><div className="field"><label htmlFor="cycle-max">Limit per employee</label><input id="cycle-max" type="number" value={maxQty} onChange={e => setMaxQty(e.target.value)} min="1" max="100" step="1" required /></div></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary" type="submit" disabled={loading}>{loading ? "Adding…" : "Add product to cycle"}</button></form>;
}
