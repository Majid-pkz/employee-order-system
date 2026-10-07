import Link from "next/link";
import { UsersRound, Package, CalendarDays, ClipboardList, ArrowUpRight, ShieldCheck } from "lucide-react";
import { requireAdminPage } from "@/lib/access";
import { prisma } from "@/lib/prisma";
export default async function AdminDashboardPage() {
  const admin = await requireAdminPage();
  const [employees, products, cycle, orders] = await Promise.all([prisma.employee.count({ where: { isActive: true } }), prisma.product.count({ where: { isActive: true } }), prisma.orderCycle.findFirst({ where: { status: "open" } }), prisma.order.count()]);
  return <div><div className="admin-heading"><div><span className="eyebrow">YOUR STAFF SALES, ALL TOGETHER</span><h1>Hello, {admin.name || admin.username}.</h1><p>Keep the good things moving. Here’s your pantry at a glance.</p></div><Link href="/admin/cycles/new" className="button button-primary">Create a cycle <ArrowUpRight size={15} /></Link></div><div className="admin-stat-grid"><div className="admin-stat"><UsersRound size={23} /><p>Active employees</p><strong>{employees}</strong></div><div className="admin-stat"><Package size={23} /><p>Active products</p><strong>{products}</strong></div><div className="admin-stat"><CalendarDays size={23} /><p>Open sales cycle</p><strong className="cycle-name">{cycle?.name || "None open"}</strong></div><div className="admin-stat"><ClipboardList size={23} /><p>Total orders</p><strong>{orders}</strong></div></div><div className="admin-shortcuts">{[
    { href: "/admin/products", title: "Make the selection", text: "Manage products, staff prices and catalogue photos.", icon: Package },
    { href: "/admin/cycles", title: "Plan the next cycle", text: "Set the deadline, quantities and available products.", icon: CalendarDays },
    { href: "/admin/employees", title: "Look after your people", text: "Provision employee accounts and reset passcodes.", icon: UsersRound },
    { href: "/admin/orders", title: "Get collection ready", text: "Review quantities, manage orders and export PDFs.", icon: ClipboardList },
  ].map(item => <Link className="admin-shortcut" key={item.href} href={item.href}><item.icon size={25} strokeWidth={1.5} /><div><h2>{item.title}</h2><p>{item.text}</p></div><ArrowUpRight size={17} /></Link>)}</div><div className="admin-tip"><ShieldCheck size={24} /><div><h2>Employee verification is required.</h2><p>Each order is linked to the signed-in employee. Supply a private passcode of at least 8 characters before giving an employee access.</p></div></div></div>;
}
