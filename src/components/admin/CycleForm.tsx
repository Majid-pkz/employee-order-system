"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
type Initial = { id: string; name: string; deadline: string | null };
function localInput(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
export function CycleForm({ initialData }: { initialData?: Initial }) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || "");
  const [deadline, setDeadline] = useState(localInput(initialData?.deadline));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch(initialData ? "/api/admin/cycles/" + initialData.id : "/api/admin/cycles", { method: initialData ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, deadline: deadline ? new Date(deadline).toISOString() : null }) });
      const result = await response.json();
      if (!response.ok) { setError(result.error); return; }
      router.push("/admin/cycles/" + result.id); router.refresh();
    } catch { setError("We could not save this cycle. Please try again."); }
    finally { setLoading(false); }
  }
  return <form className="admin-form" onSubmit={submit}><div className="field"><label htmlFor="cycle-name">Cycle name</label><input id="cycle-name" value={name} onChange={e => setName(e.target.value)} maxLength={120} placeholder="e.g. October staff favourites" required /></div><div className="field"><label htmlFor="cycle-deadline">Order deadline (your local time)</label><input id="cycle-deadline" type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} /><p className="form-note">Orders and edits stop automatically at this time. A draft cycle opens only when you choose Open cycle.</p></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button className="button button-primary" type="submit" disabled={loading}><Save size={15} />{loading ? "Saving…" : initialData ? "Save cycle" : "Create draft cycle"}</button><button className="button button-outline" type="button" onClick={() => router.push("/admin/cycles")}>Cancel</button></div></form>;
}
