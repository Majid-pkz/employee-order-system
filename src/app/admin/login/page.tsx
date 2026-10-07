import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/Brand";
import { SignInForm } from "@/components/SignInForm";
import { getAdmin } from "@/lib/access";
import { ArrowLeft } from "lucide-react";
export const dynamic = "force-dynamic";
export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin");
  return <main className="admin-sign-in"><Brand /><div className="sign-in-card"><span className="eyebrow">STAFF SALES MANAGEMENT</span><h1>Welcome back.</h1><p>Sign in to manage your catalogue, cycles and orders.</p><SignInForm role="admin" /></div><Link href="/" className="text-button"><ArrowLeft size={15} /> Back to the staff shop</Link></main>;
}
