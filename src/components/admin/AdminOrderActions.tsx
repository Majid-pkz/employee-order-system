"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminOrderActions({
  orderId,
  itemId,
  cycleStatus,
}: {
  orderId: string;
  itemId: string;
  cycleStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRemoveItem() {
    if (!confirm("Remove this item from the order?")) return;

    setLoading(true);
    const res = await fetch(`/api/admin/orders/${orderId}/items/${itemId}`, {
      method: "DELETE",
    });
    setLoading(false);

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to remove item");
    }
  }

  return (
    <button
      onClick={handleRemoveItem}
      disabled={loading}
      className="text-red-600 hover:underline text-sm disabled:opacity-50"
    >
      {loading ? "Removing..." : "Remove"}
    </button>
  );
}