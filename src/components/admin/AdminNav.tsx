import { Brand } from "@/components/Brand";
import { AdminLinks } from "@/components/admin/AdminLinks";
import { requireAdminPage } from "@/lib/access";
import { signOut } from "@/lib/auth";
export async function AdminNav() {
  const admin = await requireAdminPage();
  return <aside className="admin-sidebar"><Brand light /><span className="admin-sidebar-title">YOUR WORKSPACE</span><AdminLinks /><div className="admin-user"><span>{admin.name || admin.username}<small>Staff sales administrator</small></span><form action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}><button type="submit">Sign out</button></form></div></aside>;
}
