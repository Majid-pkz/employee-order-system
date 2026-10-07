"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function AdminMutationButton({ url, method = "DELETE", body, label, loadingLabel = "Saving…", confirmMessage, danger = false }: { url: string; method?: "DELETE" | "PUT"; body?: Record<string, string>; label: string; loadingLabel?: string; confirmMessage?: string; danger?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function act() {
    if (confirmMessage && !confirm(confirmMessage)) return;
    setLoading(true); setError("");
    try {
      const response = await fetch(url, { method, ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}) });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "The change could not be saved."); return; }
      router.refresh();
    } catch { setError("We could not connect. Please try again."); }
    finally { setLoading(false); }
  }
  return <div><button type="button" disabled={loading} onClick={act} className={"text-button" + (danger ? " text-red-600" : "")}>{loading ? loadingLabel : label}</button>{error && <p className="form-error" role="alert">{error}</p>}</div>;
}
