import { Leaf, ShieldCheck, ShoppingBag } from "lucide-react";
import { Brand } from "@/components/Brand";
import Link from "next/link";
export function PublicFooter() {
  return <footer className="public-footer"><div className="site-container">
    <div className="service-notes"><div><Leaf size={19} /><span>Everyday favourites<br /><strong>Staff-only prices</strong></span></div><div><ShieldCheck size={19} /><span>Your account, your order<br /><strong>Verified employee access</strong></span></div><div><ShoppingBag size={19} /><span>One simple collection<br /><strong>Pay on collection</strong></span></div></div>
    <div className="footer-bottom"><Brand /><p>Good food. A thoughtful little perk.</p><Link href="/admin/login">Administrator access</Link></div>
  </div></footer>;
}
