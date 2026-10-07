"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
type Initial = { id: string; employeeId: string; fullName: string; isActive: boolean; hasPin: boolean };
export function EmployeeForm({ initialData }: { initialData?: Initial }) {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState(initialData?.employeeId || "");
  const [fullName, setFullName] = useState(initialData?.fullName || "");
  const [pin, setPin] = useState("");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const data = { ...(!initialData ? { employeeId } : {}), fullName, ...(pin ? { pin } : {}), isActive };
      const response = await fetch(initialData ? "/api/admin/employees/" + initialData.id : "/api/admin/employees", { method: initialData ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) { setError(result.error); return; }
      router.push("/admin/employees"); router.refresh();
    } catch { setError("We could not save this employee. Please try again."); }
    finally { setLoading(false); }
  }
  return <form className="admin-form" onSubmit={submit}><div className="field"><label htmlFor="employeeId">Employee ID</label><input id="employeeId" value={employeeId} onChange={e => setEmployeeId(e.target.value)} disabled={!!initialData} maxLength={40} pattern="[a-zA-Z0-9_-]+" required /></div><div className="field"><label htmlFor="fullName">Full name</label><input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} maxLength={120} required /></div><div className="field"><label htmlFor="new-passcode">{initialData ? "New passcode" : "Employee passcode"}</label><input id="new-passcode" type="password" autoComplete="new-password" value={pin} onChange={e => setPin(e.target.value)} minLength={8} maxLength={72} required={!initialData || !initialData.hasPin} /><p className="form-note">At least 8 characters. Give this privately to the employee.{initialData?.hasPin ? " Leave blank to keep the current passcode." : ""}</p></div><div className="checkbox-field"><input type="checkbox" id="employee-active" checked={isActive} onChange={e => setIsActive(e.target.checked)} /><label htmlFor="employee-active">Account is active</label></div>{initialData && <p className="form-note">Saving changes signs this employee out of their existing sessions.</p>}{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button type="submit" className="button button-primary" disabled={loading}><Save size={15} />{loading ? "Saving…" : initialData ? "Save employee" : "Create employee"}</button><button type="button" className="button button-outline" onClick={() => router.push("/admin/employees")}>Cancel</button></div></form>;
}
