"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RemoveCycleProductButton({
  cycleProductId,
}: {
  cycleProductId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

 async function handleRemove() {
  if (
    !confirm(
      "Remove this product from the cycle?\n\nIt will also be removed from all existing orders and totals will be recalculated."
    )
  ) {
    return;
  }

  setLoading(true);
  const res = await fetch(`/api/admin/cycle-products/${cycleProductId}`, {
    method: "DELETE",
  });
  setLoading(false);

  if (res.ok) {
    const data = await res.json();
    if (data.affectedOrders > 0) {
      alert(
        `Product removed. ${data.affectedOrders} order(s) were updated.`
      );
    }
    router.refresh();
  } else {
    alert("Failed to remove product");
  }
}

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      className="text-red-600 hover:underline disabled:opacity-50"
    >
      {loading ? "Removing..." : "Remove"}
    </button>
  );
}