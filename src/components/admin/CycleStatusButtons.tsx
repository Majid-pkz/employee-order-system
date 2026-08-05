"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CycleStatusButtons({
  cycleId,
  currentStatus,
}: {
  cycleId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: string) {
    setLoading(true);

    const res = await fetch(`/api/admin/cycles/${cycleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    setLoading(false);

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to update status");
    }
  }

  return (
    <div className="flex gap-3">
      {currentStatus !== "open" && (
        <button
          onClick={() => updateStatus("open")}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          Open Cycle
        </button>
      )}

      {currentStatus === "open" && (
        <button
          onClick={() => updateStatus("closed")}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
        >
          Close Cycle
        </button>
      )}

      {currentStatus === "draft" && (
        <span className="text-sm text-gray-500 self-center">
          Draft – open when ready
        </span>
      )}
    </div>
  );
}