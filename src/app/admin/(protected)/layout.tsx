import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdminPage } from "@/lib/access";
export const dynamic = "force-dynamic";
export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return <div className="admin-shell"><AdminNav /><div className="admin-workspace"><header className="admin-topbar"><span>Staff Pantry <span className="muted">/</span> <strong>Sales workspace</strong></span><Link href="/" className="text-button">Open staff shop <ArrowUpRight size={13} /></Link></header><main className="admin-main">{children}</main></div></div>;
}
