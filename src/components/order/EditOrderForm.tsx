"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  cycleProductId: string;
  name: string;
  description: string | null;
  price: number;
  maxQty: number;
  imagePath: string | null;
};

type EditOrderFormProps = {
  cycleId: string;
  products: Product[];
};

export function EditOrderForm({ cycleId, products }: EditOrderFormProps) {
  const router = useRouter();

  const [step, setStep] = useState<"lookup" | "edit">("lookup");
  const [employeeId, setEmployeeId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Order data after lookup
  const [orderId, setOrderId] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [success, setSuccess] = useState(false);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/orders/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cycleId,
        employeeId: employeeId.trim(),
        pin: pin || undefined,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Order not found");
      return;
    }

    const data = await res.json();

    setOrderId(data.orderId);
    setOrderNumber(data.orderNumber);
    setEmployeeName(data.employeeName);

    // Pre-fill quantities from existing order
    const qtyMap: Record<string, number> = {};
    for (const item of data.items) {
      qtyMap[item.cycleProductId] = item.quantity;
    }
    setQuantities(qtyMap);

    setStep("edit");
  }

  function updateQuantity(cycleProductId: string, value: string, maxQty: number) {
    const qty = parseInt(value, 10);
    if (isNaN(qty) || qty < 0) {
      setQuantities((prev) => ({ ...prev, [cycleProductId]: 0 }));
      return;
    }
    setQuantities((prev) => ({
      ...prev,
      [cycleProductId]: Math.min(qty, maxQty),
    }));
  }

  const grandTotal = products.reduce((sum, p) => {
    const qty = quantities[p.cycleProductId] || 0;
    return sum + qty * p.price;
  }, 0);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const items = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([cycleProductId, quantity]) => ({
        cycleProductId,
        quantity,
      }));

    if (items.length === 0) {
      setError("Please select at least one product");
      setLoading(false);
      return;
    }

    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update order");
      return;
    }

    setSuccess(true);
  }

  // Success screen
  if (success) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">
          Order Updated!
        </h2>
        <p className="text-lg mb-2">
          Order number: <strong>{orderNumber}</strong>
        </p>
        <p className="mb-6">
          New total: <strong>${grandTotal.toFixed(2)}</strong>
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Back to home
        </button>
      </div>
    );
  }

  // Step 1: Lookup
  if (step === "lookup") {
    return (
      <form
        onSubmit={handleLookup}
        className="bg-white rounded-lg shadow p-6 space-y-4 max-w-md mx-auto"
      >
        <h2 className="text-lg font-semibold">Find your order</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Employee ID</label>
          <input
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            PIN (optional)
          </label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Looking up..." : "Find My Order"}
        </button>
      </form>
    );
  }

  // Step 2: Edit quantities
  return (
    <form
      onSubmit={handleSave}
      className="bg-white rounded-lg shadow p-6 space-y-6"
    >
      <div className="bg-blue-50 border border-blue-200 rounded p-4">
        <p>
          <strong>{employeeName}</strong> (ID: {employeeId})
        </p>
        <p className="text-sm text-gray-600">
          Order number: {orderNumber}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Update quantities</h2>

        {products.map((product) => (
          <div
            key={product.cycleProductId}
            className="flex items-center gap-4 border-b pb-4"
          >
            {product.imagePath ? (
              <img
                src={product.imagePath}
                alt={product.name}
                className="w-16 h-16 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded" />
            )}

            <div className="flex-1">
              <div className="font-medium">{product.name}</div>
              <div className="text-sm">
                ${product.price.toFixed(2)} each (max {product.maxQty})
              </div>
            </div>

            <div className="w-24">
              <input
                type="number"
                min="0"
                max={product.maxQty}
                value={quantities[product.cycleProductId] || ""}
                onChange={(e) =>
                  updateQuantity(
                    product.cycleProductId,
                    e.target.value,
                    product.maxQty
                  )
                }
                className="w-full border rounded px-3 py-2 text-center"
                placeholder="0"
              />
            </div>

            <div className="w-24 text-right font-medium">
              $
              {(
                (quantities[product.cycleProductId] || 0) * product.price
              ).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center text-xl font-bold border-t pt-4">
        <span>New Total</span>
        <span>${grandTotal.toFixed(2)}</span>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}