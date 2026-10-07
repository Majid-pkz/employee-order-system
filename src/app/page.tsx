import Link from "next/link";
import { ArrowDown, ArrowRight, CalendarDays, Leaf } from "lucide-react";
import { PublicHeader } from "@/components/order/PublicHeader";
import { PublicFooter } from "@/components/order/PublicFooter";
import { OrderForm } from "@/components/order/OrderForm";
import { getEmployee } from "@/lib/access";
import { getOpenCycle, formatDeadline } from "@/lib/cycles";
export const dynamic = "force-dynamic";
export default async function HomePage() {
  const [cycle, employee] = await Promise.all([getOpenCycle(), getEmployee()]);
  const deadlineLabel = cycle?.deadline ? formatDeadline(cycle.deadline) : null;
  const demo = process.env.DEMO_MODE === "true" && process.env.DEMO_EMPLOYEE_PASSWORD ? { id: process.env.DEMO_EMPLOYEE_ID || "DEMO001", password: process.env.DEMO_EMPLOYEE_PASSWORD } : undefined;
  return <><PublicHeader /><main>
    <section className="shop-hero"><div className="site-container hero-inner"><div className="hero-copy"><span className="eyebrow"><span className="status-dot" />{cycle ? "YOUR STAFF SALES CYCLE IS OPEN" : "YOUR EVERYDAY STAFF PERK"}</span><h1>A little pantry.<br /><em>A lot to love.</em></h1><p>Everyday favourites, thoughtful staff prices.<br className="desktop-break" /> Pick your good things. We’ll take care of the rest.</p><div className="hero-actions">{cycle ? <a href="#catalogue" className="button button-primary">Explore the selection <ArrowDown size={16} /></a> : <Link href="/edit" className="button button-primary">View my orders <ArrowRight size={16} /></Link>}<span><Leaf size={17} /> Made for your team</span></div></div><div className="cycle-callout"><span className="eyebrow">{cycle ? "ON THE MENU" : "THE NEXT GOOD THING"}</span><h2>{cycle?.name || "Back soon."}</h2><p>{cycle ? "A fresh selection of dairy, drinks and pantry favourites." : "There isn’t an open sales cycle right now. Check back when your staff sales team opens the next one."}</p>{deadlineLabel && <div className="cycle-deadline"><CalendarDays size={18} /><span>Order by<strong>{deadlineLabel}</strong></span></div>}<span className="cycle-tag">{cycle ? "Pay on collection" : "Orders are currently closed"}</span></div></div></section>
    <div className="site-container shop-main">{cycle ? <OrderForm cycleId={cycle.id} cycleName={cycle.name} employeeName={employee?.fullName || null} deadlineLabel={deadlineLabel} demo={demo} products={cycle.cycleProducts.map(cp => ({ cycleProductId: cp.id, name: cp.product.name, description: cp.product.description, category: cp.product.category, unit: cp.product.unit, price: Number(cp.price), marketPrice: Number(cp.product.marketPrice), maxQty: cp.maxQtyPerPerson, imagePath: cp.product.imagePath }))} /> : <section className="closed-cycle"><ShoppingClosed /><h2>Good things will be back.</h2><p>Your existing orders are still available in My order.</p><Link href="/edit" className="text-button">View my order <ArrowRight size={15} /></Link></section>}</div>
  </main><PublicFooter /></>;
}
function ShoppingClosed() { return <span className="closed-icon"><Leaf size={30} strokeWidth={1.3} /></span>; }
