import Link from "next/link";
import { ShoppingBag, UserRound, ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/Brand";
import { getEmployee, getAdmin } from "@/lib/access";
import { signOut } from "@/lib/auth";
export async function PublicHeader() {
  const employee = await getEmployee();
  const admin = !employee ? await getAdmin() : null;
  return <>
    {process.env.DEMO_MODE === "true" && <div className="demo-strip">Portfolio demo <span>·</span> Fictional products and employee accounts</div>}
    <div className="top-strip"><div className="site-container"><span>A little more good in your everyday.</span><Link href="/admin">Staff sales admin <ArrowUpRight size={12} /></Link></div></div>
    <header className="site-header"><div className="site-container header-inner">
      <Brand />
      <nav aria-label="Main navigation"><Link href="/#catalogue" className="nav-link">Shop the cycle</Link><Link href="/edit" className="nav-link"><ShoppingBag size={16} /> My order</Link>
      {employee ? <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }} className="account-nav"><span><UserRound size={16} />{employee.fullName.split(" ")[0]}</span><button className="text-button" type="submit">Sign out</button></form> : <Link href="/account/sign-in" className="button button-outline button-small"><UserRound size={15} />{admin ? "Employee sign in" : "Sign in"}</Link>}
      </nav>
    </div></header>
  </>;
}
