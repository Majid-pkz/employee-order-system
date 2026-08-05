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
    if (!confirm("Remove this product from the cycle?")) return;

    setLoading(true);
    const res = await fetch(`/api/admin/cycle-products/${cycleProductId}`, {
      method: "DELETE",
    });
    setLoading(false);

    if (res.ok) {
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