import Link from "next/link";
import { ArrowRight, ShoppingBag, LockKeyhole } from "lucide-react";
import { PublicHeader } from "@/components/order/PublicHeader";
import { PublicFooter } from "@/components/order/PublicFooter";
import { EditOrderForm } from "@/components/order/EditOrderForm";
import { requireEmployeePage } from "@/lib/access";
import { getOpenCycle, formatDeadline } from "@/lib/cycles";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
const money = (value: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(value);
export default async function EditOrderPage() {
  const employee = await requireEmployeePage();
  const cycle = await getOpenCycle();
  const orders = await prisma.order.findMany({ where: { employeeId: employee.employeeId }, include: { cycle: true, items: { include: { cycleProduct: { include: { product: true } } } } }, orderBy: { createdAt: "desc" }, take: 20 });
  const current = orders.find(order => order.cycleId === cycle?.id && order.status !== "cancelled");
  return <><PublicHeader /><main className="site-container my-order-page"><div className="my-order-heading"><span className="eyebrow">YOUR VERIFIED ACCOUNT</span><h1>Your order, <em>all together.</em></h1><p>{employee.fullName} · Employee {employee.employeeId}</p></div>
    {cycle && current ? <EditOrderForm cycleId={cycle.id} cycleName={cycle.name} employeeName={employee.fullName} deadlineLabel={cycle.deadline ? formatDeadline(cycle.deadline) : null} orderId={current.id} orderNumber={current.orderNumber} initialQuantities={Object.fromEntries(current.items.map(i => [i.cycleProductId, i.quantity]))} products={cycle.cycleProducts.map(cp => ({ cycleProductId: cp.id, name: cp.product.name, description: cp.product.description, category: cp.product.category, unit: cp.product.unit, price: Number(cp.price), marketPrice: Number(cp.product.marketPrice), maxQty: cp.maxQtyPerPerson, imagePath: cp.product.imagePath }))} /> : <section className="my-order-empty"><ShoppingBag size={32} /><h2>{cycle ? "Your basket is waiting." : "Your past orders are safe here."}</h2><p>{cycle ? "You haven’t placed an active order for this cycle yet." : "There is no open cycle at the moment."}</p><Link href="/" className="button button-primary">Back to the pantry <ArrowRight size={15} /></Link></section>}
    {orders.filter(order => order.id !== current?.id).length > 0 && <section className="order-history"><h2>Previous orders</h2><div className="history-grid">{orders.filter(order => order.id !== current?.id).map(order => <article key={order.id} className="history-card"><div className="history-card-heading"><div><span className="eyebrow">{order.orderNumber}</span><h3>{order.cycle.name}</h3></div><span className="status-pill">{order.status}</span></div><ul>{order.items.map(item => <li key={item.id}><span>{item.quantity} × {item.cycleProduct.product.name}</span><strong>{money(Number(item.lineTotal))}</strong></li>)}</ul><div className="history-total"><span>Total</span><strong>{money(Number(order.totalAmount))}</strong></div><p><LockKeyhole size={13} />This order can no longer be edited.</p></article>)}</div></section>}
  </main><PublicFooter /></>;
}
