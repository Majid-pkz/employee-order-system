import { Leaf } from "lucide-react";
import Link from "next/link";
export function Brand({ light = false }: { light?: boolean }) {
  return <Link href="/" className={"brand" + (light ? " brand-light" : "")} aria-label="Staff Pantry home">
    <span className="brand-mark"><Leaf size={24} strokeWidth={1.6} /></span>
    <span>staff<span className="brand-emphasis">pantry</span><small>GOOD FOOD. SHARED PERKS.</small></span>
  </Link>;
}
