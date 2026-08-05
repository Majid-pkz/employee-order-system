"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CycleFormProps = {
  initialData?: {
    id: string;
    name: string;
    deadline: string | null; // ISO string
    status: string;
  };
};

export function CycleForm({ initialData }: CycleFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name ?? "");
  const [deadline, setDeadline] = useState(
    initialData?.deadline
      ? new Date(initialData.deadline).toISOString().slice(0, 16)
      : ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      name,
      deadline: deadline ? new Date(deadline).toISOString() : null,
    };

    const url = isEditing
      ? `/api/admin/cycles/${initialData.id}`
      : `/api/admin/cycles`;

    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }

    const data = await res.json();
    router.push(`/admin/cycles/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium mb-1">Cycle Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="e.g. August 2026"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Order Deadline</label>
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <p className="text-xs text-gray-500 mt-1">
          After this date/time employees should no longer be able to place or edit orders.
        </p>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : isEditing ? "Update Cycle" : "Create Cycle"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/cycles")}
          className="border px-4 py-2 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}