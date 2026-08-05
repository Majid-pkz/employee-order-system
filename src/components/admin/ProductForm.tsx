"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProductFormProps = {
  initialData?: {
    id: string;
    name: string;
    description: string | null;
    marketPrice: number;
    discountedPrice: number;
    imagePath: string | null;
    isActive: boolean;
  };
};

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [marketPrice, setMarketPrice] = useState(
    initialData?.marketPrice?.toString() ?? ""
  );
  const [discountedPrice, setDiscountedPrice] = useState(
    initialData?.discountedPrice?.toString() ?? ""
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const market = parseFloat(marketPrice);
    const discounted = parseFloat(discountedPrice);

    if (isNaN(market) || market < 0 || isNaN(discounted) || discounted < 0) {
      setError("Please enter valid prices");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description || "");
    formData.append("marketPrice", market.toString());
    formData.append("discountedPrice", discounted.toString());
    formData.append("isActive", isActive.toString());

    if (imageFile) {
      formData.append("image", imageFile);
    }

    const url = isEditing
      ? `/api/admin/products/${initialData.id}`
      : `/api/admin/products`;

    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      body: formData, // important: no Content-Type header when using FormData
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium mb-1">Product Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Market Price</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={marketPrice}
          onChange={(e) => setMarketPrice(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Discounted Price</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={discountedPrice}
          onChange={(e) => setDiscountedPrice(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Product Image {isEditing ? "(leave empty to keep current)" : "(optional)"}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="w-full border rounded px-3 py-2"
        />
        {initialData?.imagePath && !imageFile && (
          <p className="text-sm text-gray-500 mt-1">
            Current image: {initialData.imagePath}
          </p>
        )}
      </div>

      {isEditing && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label htmlFor="isActive">Active</label>
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="border px-4 py-2 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}