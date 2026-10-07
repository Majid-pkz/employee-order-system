"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";

type Props = { role?: "employee" | "admin"; returnTo?: string; compact?: boolean; onSuccess?: () => void; demo?: { id: string; password: string } };
export function SignInForm({ role = "employee", returnTo = "/", compact = false, onSuccess, demo }: Props) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const result = await signIn(role === "admin" ? "credentials" : "employee", {
        ...(role === "admin" ? { username: identifier, password } : { employeeId: identifier, passcode: password }),
        redirect: false,
      });
      if (!result || result.error) { setError("We could not sign you in. Check your details. After several failed attempts, wait 15 minutes before trying again."); return; }
      if (onSuccess) onSuccess(); else router.push(role === "admin" ? "/admin" : returnTo);
      router.refresh();
    } catch { setError("We could not connect. Please try again."); }
    finally { setLoading(false); }
  }
  return <form onSubmit={submit} className={"sign-in-form" + (compact ? " compact" : "")}>
    {compact && <h3><LockKeyhole size={17} /> Sign in to finish your order</h3>}
    {demo && <div className="demo-credentials"><strong>Try the employee demo</strong><p>ID: <code>{demo.id}</code> · Passcode: <code>{demo.password}</code></p><button type="button" className="text-button" onClick={() => { setIdentifier(demo.id); setPassword(demo.password); }}>Fill demo details <ArrowRight size={14} /></button></div>}
    <div className="field"><label htmlFor={role + "-identifier"}>{role === "admin" ? "Username" : "Employee ID"}</label><input id={role + "-identifier"} name="username" autoComplete="username" value={identifier} onChange={e => setIdentifier(e.target.value)} maxLength={80} required placeholder={role === "admin" ? "Your admin username" : "e.g. DEMO001"} /></div>
    <div className="field"><label htmlFor={role + "-password"}>{role === "admin" ? "Password" : "Passcode"}</label><input id={role + "-password"} name="password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} minLength={role === "employee" ? 8 : 1} maxLength={72} required placeholder="Your private sign-in details" /></div>
    {error && <p role="alert" className="form-error">{error}</p>}
    <button type="submit" className="button button-primary full-width" disabled={loading}>{loading ? "Signing in…" : "Sign in"}<ArrowRight size={17} /></button>
    {!compact && <p className="form-note">Need access or a new passcode? Contact your staff sales administrator.</p>}
  </form>;
}
