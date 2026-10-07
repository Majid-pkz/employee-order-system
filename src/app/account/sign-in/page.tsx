import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicHeader } from "@/components/order/PublicHeader";
import { PublicFooter } from "@/components/order/PublicFooter";
import { SignInForm } from "@/components/SignInForm";
import { getEmployee } from "@/lib/access";
import { ArrowLeft, ShieldCheck } from "lucide-react";
export const dynamic = "force-dynamic";
export default async function EmployeeSignInPage() {
  if (await getEmployee()) redirect("/");
  const demo = process.env.DEMO_MODE === "true" && process.env.DEMO_EMPLOYEE_PASSWORD ? { id: process.env.DEMO_EMPLOYEE_ID || "DEMO001", password: process.env.DEMO_EMPLOYEE_PASSWORD } : undefined;
  return <><PublicHeader /><main className="sign-in-page site-container"><div className="sign-in-intro"><span className="eyebrow">WELCOME TO YOUR STAFF PANTRY</span><h1>Your favourites.<br /><em>Your little perk.</em></h1><p>Sign in to place an order, make a change or check what you’re collecting.</p><div className="trust-line"><ShieldCheck size={18} /> Your orders stay linked to your verified account.</div><Link href="/" className="text-button"><ArrowLeft size={15} /> Back to the catalogue</Link></div><div className="sign-in-card"><h2>Employee sign in</h2><p>Use the details supplied by your administrator.</p><SignInForm demo={demo} /></div></main><PublicFooter /></>;
}
