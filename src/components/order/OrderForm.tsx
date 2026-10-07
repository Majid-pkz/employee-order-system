"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, CheckCircle2, LockKeyhole, Minus, Plus, Search, ShoppingBag, Trash2 } from "lucide-react";
import { productImage } from "@/lib/catalog";
import { SignInForm } from "@/components/SignInForm";

export type ShopProduct = { cycleProductId: string; name: string; description: string | null; category: string; unit: string; price: number; marketPrice: number; maxQty: number; imagePath: string | null };
export type OrderFormProps = { cycleId: string; cycleName: string; products: ShopProduct[]; employeeName: string | null; deadlineLabel: string | null; orderId?: string; orderNumber?: string; initialQuantities?: Record<string, number>; demo?: { id: string; password: string } };

const money = (value: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(value);
export function OrderForm({ cycleId, cycleName, products, employeeName, deadlineLabel, orderId, orderNumber, initialQuantities = {}, demo }: OrderFormProps) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>(initialQuantities);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [success, setSuccess] = useState<{ orderNumber: string; totalAmount: string } | null>(null);
  const categories = ["All", ...new Set(products.map(p => p.category))];
  const visible = products.filter(p => (category === "All" || p.category === category) && p.name.toLowerCase().includes(query.toLowerCase()));
  const selected = products.filter(p => (quantities[p.cycleProductId] || 0) > 0);
  const totalUnits = selected.reduce((sum, p) => sum + quantities[p.cycleProductId], 0);
  const total = selected.reduce((sum, p) => sum + Math.round(p.price * 100) * quantities[p.cycleProductId], 0) / 100;
  const savings = selected.reduce((sum, p) => sum + Math.max(0, Math.round(p.marketPrice * 100) - Math.round(p.price * 100)) * quantities[p.cycleProductId], 0) / 100;

  function change(product: ShopProduct, quantity: number) {
    setQuantities(prev => ({ ...prev, [product.cycleProductId]: Math.max(0, Math.min(product.maxQty, Math.trunc(quantity))) }));
    setError("");
  }
  async function submit() {
    if (!employeeName) { setShowSignIn(true); return; }
    setLoading(true); setError("");
    try {
      const items = selected.map(p => ({ cycleProductId: p.cycleProductId, quantity: quantities[p.cycleProductId] }));
      const response = await fetch(orderId ? "/api/orders/" + orderId : "/api/orders", {
        method: orderId ? "PUT" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderId ? { items } : { cycleId, items }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "We could not save your order."); if (response.status === 401) { setShowSignIn(true); router.refresh(); } return; }
      setSuccess(data);
    } catch { setError("We could not connect. Your order has not been confirmed. Please try again."); }
    finally { setLoading(false); }
  }
  if (success) return <section className="order-success" role="status"><span className="success-icon"><CheckCircle2 size={36} /></span><span className="eyebrow">ALL SORTED</span><h2>{orderId ? "Your order is updated." : "A little goodness, reserved."}</h2><p>{employeeName}, your order has been saved to your verified account.</p><div className="confirmation-details"><div><span>Order number</span><strong>{success.orderNumber}</strong></div><div><span>Order total</span><strong>{money(Number(success.totalAmount))}</strong></div><div><span>Payment</span><strong>On collection</strong></div></div><p className="form-note">Your staff sales team will confirm collection arrangements.</p><div className="success-actions"><Link href="/edit" className="button button-primary" onClick={() => router.refresh()}>View my order <ArrowRight size={16} /></Link><Link href="/" className="button button-outline">Back to the pantry</Link></div></section>;

  return <div className="shop-layout" id="catalogue">
    <section className="catalogue">
      <div className="catalogue-heading"><div><span className="eyebrow">{orderId ? "MAKE IT JUST RIGHT" : "THE STAFF SELECTION"}</span><h2>{orderId ? "Edit your favourites." : "This cycle’s good things."}</h2></div><span className="product-count">{products.length} favourites</span></div>
      <div className="catalogue-tools"><div className="category-tabs" aria-label="Product categories">{categories.map(c => <button type="button" key={c} className={category === c ? "active" : ""} aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>)}</div><label className="product-search"><Search size={17} /><span className="sr-only">Search products</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a favourite" type="search" /></label></div>
      <div className="product-grid">{visible.map(product => {
        const qty = quantities[product.cycleProductId] || 0;
        const image = productImage(product.imagePath, product.name);
        const discount = product.marketPrice > product.price && product.marketPrice > 0 ? Math.round((1 - product.price / product.marketPrice) * 100) : 0;
        return <article className={"product-card" + (qty ? " selected" : "")} key={product.cycleProductId}>
          <div className="product-photo">{image ? <Image src={image} alt={product.name} width={800} height={800} sizes="(max-width: 600px) 90vw, (max-width: 1000px) 42vw, 28vw" /> : <div className="photo-empty"><ShoppingBag size={34} /><span>{product.category}</span></div>}{discount > 0 && <span className="discount-badge">Save {discount}%</span>}{qty > 0 && <span className="selected-badge"><Check size={13} /> In your basket</span>}</div>
          <div className="product-info"><span className="product-category">{product.category} <span>·</span> {product.unit}</span><h3>{product.name}</h3><p>{product.description || "An everyday favourite at your staff price."}</p><div className="product-price"><strong>{money(product.price)}</strong>{product.marketPrice > product.price && <del aria-label={"Regular price " + money(product.marketPrice)}>{money(product.marketPrice)}</del>}<span>staff price</span></div>
          <div className="product-controls">{qty ? <div className="quantity-stepper"><button type="button" aria-label={"Decrease " + product.name} onClick={() => change(product, qty - 1)}><Minus size={15} /></button><output aria-label={product.name + " quantity"}>{qty}</output><button type="button" aria-label={"Increase " + product.name} onClick={() => change(product, qty + 1)} disabled={qty >= product.maxQty}><Plus size={15} /></button></div> : <button className="add-button" type="button" onClick={() => change(product, 1)}><Plus size={16} /> Add to basket</button>}<span className="quantity-limit">Limit {product.maxQty}</span></div>
          </div>
        </article>;
      })}</div>
      {!visible.length && <div className="empty-search"><Search size={24} /><h3>No favourites found.</h3><p>Try another search or category.</p><button className="text-button" onClick={() => { setCategory("All"); setQuery(""); }}>Clear filters</button></div>}
      <p className="catalogue-caption">Product photos are illustrative. Collection packaging may vary.</p>
    </section>
    <aside className="basket" id="basket" aria-label="Your order summary">
      <div className="basket-title"><span className="basket-icon"><ShoppingBag size={21} /></span><div><h2>{orderId ? "Your order" : "Your basket"}</h2><p>{orderNumber || cycleName}</p></div><span className="basket-count">{totalUnits}</span></div>
      {selected.length ? <div className="basket-items">{selected.map(p => { const image = productImage(p.imagePath, p.name); return <div className="basket-item" key={p.cycleProductId}>{image && <Image src={image} alt="" width={52} height={52} />}<div className="basket-item-name"><strong>{p.name}</strong><span>{quantities[p.cycleProductId]} × {money(p.price)}</span></div><div className="basket-item-end"><strong>{money(Math.round(p.price * 100) * quantities[p.cycleProductId] / 100)}</strong><button type="button" onClick={() => change(p, 0)} aria-label={"Remove " + p.name}><Trash2 size={13} /></button></div></div>; })}</div> : <div className="basket-empty"><ShoppingBag size={32} strokeWidth={1.1} /><h3>Make yourself a little basket.</h3><p>Add a few favourites and they’ll appear right here.</p></div>}
      {selected.length > 0 && <><div className="basket-subtotal"><span>Subtotal</span><strong>{money(total)}</strong></div>{savings > 0 && <div className="basket-savings"><span>Your staff savings</span><strong>{money(savings)}</strong></div>}</>}
      <div className="basket-total"><span>Total</span><strong>{money(total)}</strong></div>
      {employeeName && <div className="verified-account"><CheckCircle2 size={16} /><span>Ordering as <strong>{employeeName}</strong></span></div>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {!employeeName && showSignIn ? <SignInForm compact demo={demo} onSuccess={() => { setShowSignIn(false); router.refresh(); }} /> : <button className="button button-primary full-width" onClick={submit} disabled={loading || !selected.length}>{loading ? "Saving your order…" : !employeeName ? "Sign in to place order" : orderId ? "Save my changes" : "Place my order"}<ArrowRight size={17} /></button>}
      {deadlineLabel && <p className="basket-deadline">Orders close {deadlineLabel}</p>}
      <div className="basket-note"><LockKeyhole size={15} /><p>One order per employee. You can make changes until the deadline.</p></div>
      <p className="collection-note">Pay on collection. No online payment required.</p>
      {employeeName && !orderId && <Link href="/edit" className="text-button basket-edit-link">Already ordered? View my order <ArrowRight size={13} /></Link>}
    </aside>
    {selected.length > 0 && <a href="#basket" className="mobile-basket-link"><span><ShoppingBag size={17} /> {totalUnits} {totalUnits === 1 ? "item" : "items"} in your basket</span><strong>{money(total)} <ArrowRight size={15} /></strong></a>}
  </div>;
}
