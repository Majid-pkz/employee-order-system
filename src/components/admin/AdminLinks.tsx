"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UsersRound, Package, CalendarDays, ClipboardList } from "lucide-react";
const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/employees", label: "Employees", icon: UsersRound },
  { href: "/admin/products", label: "Catalogue", icon: Package },
  { href: "/admin/cycles", label: "Sales cycles", icon: CalendarDays },
  { href: "/admin/orders", label: "Orders & exports", icon: ClipboardList },
];
export function AdminLinks() {
  const pathname = usePathname();
  return <nav className="admin-links" aria-label="Admin navigation">{links.map(link => { const active = link.href === "/admin" ? pathname === link.href : pathname.startsWith(link.href); return <Link key={link.href} href={link.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}><link.icon size={17} strokeWidth={1.6} />{link.label}</Link>; })}</nav>;
}
