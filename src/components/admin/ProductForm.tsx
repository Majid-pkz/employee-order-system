"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save } from "lucide-react";
import { IMAGE_OPTIONS, PRODUCT_CATEGORIES, productImage } from "@/lib/catalog";
type Initial = { id: string; name: string; description: string | null; marketPrice: number; discountedPrice: number; imagePath: string | null; isActive: boolean; category?: string; unit?: string };
export function ProductForm({ initialData }: { initialData?: Initial }) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [marketPrice, setMarketPrice] = useState(initialData?.marketPrice.toString() || "");
  const [discountedPrice, setDiscountedPrice] = useState(initialData?.discountedPrice.toString() || "");
  const [category, setCategory] = useState(initialData?.category || "Dairy");
  const [unit, setUnit] = useState(initialData?.unit || "");
  const [imagePath, setImagePath] = useState(initialData ? productImage(initialData.imagePath, initialData.name) : IMAGE_OPTIONS[0].path);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch(initialData ? "/api/admin/products/" + initialData.id : "/api/admin/products", { method: initialData ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description: description || null, marketPrice: Number(marketPrice), discountedPrice: Number(discountedPrice), category, unit, imagePath, isActive }) });
      const result = await response.json();
      if (!response.ok) { setError(result.error); return; }
      router.push("/admin/products"); router.refresh();
    } catch { setError("We could not save this product. Please try again."); }
    finally { setLoading(false); }
  }
  return <form className="admin-form" onSubmit={submit}><div className="field"><label htmlFor="product-name">Product name</label><input id="product-name" value={name} onChange={e => setName(e.target.value)} maxLength={120} required /></div><div className="field"><label htmlFor="product-description">Description</label><textarea id="product-description" value={description} onChange={e => setDescription(e.target.value)} maxLength={500} /></div><div className="admin-form-grid"><div className="field"><label htmlFor="product-category">Category</label><select id="product-category" value={category} onChange={e => setCategory(e.target.value)}>{PRODUCT_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div><div className="field"><label htmlFor="product-unit">Pack size</label><input id="product-unit" value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g. 1 litre or 500 g" maxLength={40} required /></div></div><div className="admin-form-grid"><div className="field"><label htmlFor="market-price">Regular price (AUD)</label><input id="market-price" type="number" step="0.01" min="0" max="10000" value={marketPrice} onChange={e => setMarketPrice(e.target.value)} required /></div><div className="field"><label htmlFor="staff-price">Staff price (AUD)</label><input id="staff-price" type="number" step="0.01" min="0" max="10000" value={discountedPrice} onChange={e => setDiscountedPrice(e.target.value)} required /></div></div><fieldset><legend className="text-sm font-medium">Catalogue photo</legend><div className="photo-select">{IMAGE_OPTIONS.map(option => <button type="button" key={option.path} className={"photo-option" + (imagePath === option.path ? " active" : "")} aria-pressed={imagePath === option.path} onClick={() => setImagePath(option.path)}><Image src={option.path} alt={option.label} width={160} height={160} sizes="160px" /><span>{option.label}</span></button>)}</div><button className="text-button" type="button" onClick={() => setImagePath(null)}>Use a simple category placeholder</button><p className="photo-attribution">Unbranded AI-generated photos. Illustrative only.</p></fieldset><div className="checkbox-field"><input id="product-active" type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} /><label htmlFor="product-active">Product is active</label></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button type="submit" className="button button-primary" disabled={loading}><Save size={15} />{loading ? "Saving…" : initialData ? "Save product" : "Create product"}</button><button type="button" className="button button-outline" onClick={() => router.push("/admin/products")}>Cancel</button></div></form>;
}
