"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProductOption = {
  id: string;
  name: string;
  discountedPrice: number;
};

export function AddProductToCycle({
  cycleId,
  products,
}: {
  cycleId: string;
  products: ProductOption[];
}) {
  const router = useRouter();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [price, setPrice] = useState(
    products[0]?.discountedPrice.toString() ?? ""
  );
  const [maxQty, setMaxQty] = useState("5");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleProductChange(id: string) {
    setProductId(id);
    const product = products.find((p) => p.id === id);
    if (product) {
      setPrice(product.discountedPrice.toString());
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/admin/cycles/${cycleId}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        price: parseFloat(price),
        maxQtyPerPerson: parseInt(maxQty, 10),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to add product");
      return;
    }
    // Success – reset form and refresh
    setError("");

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">Product</label>
        <select
          value={productId}
          onChange={(e) => handleProductChange(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Price in this cycle
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Max quantity per person
        </label>
        <input
          type="number"
          min="1"
          value={maxQty}
          onChange={(e) => setMaxQty(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
}