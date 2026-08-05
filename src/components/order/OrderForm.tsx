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

type OrderFormProps = {
  cycleId: string;
  cycleName: string;
  products: Product[];
};

export function OrderForm({ cycleId, cycleName, products }: OrderFormProps) {
  const router = useRouter();

  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [pin, setPin] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [nameLocked, setNameLocked] = useState(false);
  const [lookupMessage, setLookupMessage] = useState("");
  const [error, setError] = useState("");
  const [employeeFound, setEmployeeFound] = useState(false);
  const [matches, setMatches] = useState<
    { employeeId: string; fullName: string; hasPin: boolean }[]
  >([]);
  const [success, setSuccess] = useState<{
    orderNumber: string;
    isAuthenticated: boolean;
    total: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const lineTotals = products.map((p) => {
    const qty = quantities[p.cycleProductId] || 0;
    return {
      cycleProductId: p.cycleProductId,
      qty,
      lineTotal: qty * p.price,
    };
  });

  const grandTotal = lineTotals.reduce((sum, item) => sum + item.lineTotal, 0);

  function updateQuantity(
    cycleProductId: string,
    value: string,
    maxQty: number,
  ) {
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

 async function handleLookup() {
  setLookupMessage("");
  setNameLocked(false);
  setEmployeeFound(false);
  setMatches([]);

  const query = employeeId.trim() || employeeName.trim();
  if (!query) {
    setLookupMessage("Enter Employee ID or Name to look up");
    return;
  }

  const params = new URLSearchParams();
  if (employeeId.trim()) params.set("employeeId", employeeId.trim());
  if (employeeName.trim()) params.set("name", employeeName.trim());

  const res = await fetch(`/api/employees/lookup?${params.toString()}`);
  const data = await res.json();

  if (!data.matches || data.matches.length === 0) {
    setLookupMessage(
      "No employee found. You can still order, but you must sign the physical form."
    );
    return;
  }

  if (data.matches.length === 1) {
    // Exactly one match → auto-select
    const match = data.matches[0];
    setEmployeeId(match.employeeId);
    setEmployeeName(match.fullName);
    setNameLocked(true);
    setEmployeeFound(true);
    setLookupMessage(
      "Employee found. Enter PIN for full validation (optional)."
    );
  } else {
    // Multiple matches → let user choose
    setMatches(data.matches);
    setLookupMessage(
      `Found ${data.matches.length} people. Please select the correct one:`
    );
  }
}

  function selectMatch(match: {
  employeeId: string;
  fullName: string;
  hasPin: boolean;
}) {
  setEmployeeId(match.employeeId);
  setEmployeeName(match.fullName);
  setNameLocked(true);
  setEmployeeFound(true);
  setMatches([]);
  setLookupMessage(
    "Employee selected. Enter PIN for full validation (optional)."
  );
}

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const items = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([cycleProductId, quantity]) => ({
        cycleProductId,
        quantity,
      }));

    if (items.length === 0) {
      setError("Please select at least one product");
      return;
    }

    if (!employeeId.trim() || !employeeName.trim()) {
      setError("Please enter both Employee ID and Name");
      return;
    }

    // If employee was not found via lookup, ask for confirmation
    if (!employeeFound) {
      const confirmed = confirm(
        "This employee was not found in the system (or no valid PIN was used).\n\nYou must sign the physical form/notebook.\n\nDo you still want to proceed?",
      );
      if (!confirmed) return;
    }

    setLoading(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cycleId,
        employeeId: employeeId.trim(),
        employeeName: employeeName.trim(),
        pin: pin || undefined,
        items,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to submit order");
      return;
    }

    const data = await res.json();
    setSuccess({
      orderNumber: data.orderNumber,
      isAuthenticated: data.isAuthenticated,
      total: Number(data.totalAmount),
    });
  }

  // Success screen
  if (success) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">
          Order Submitted!
        </h2>
        <p className="text-lg mb-2">
          Your order number is: <strong>{success.orderNumber}</strong>
        </p>
        <p className="mb-6">
          Total: <strong>${success.total.toFixed(2)}</strong>
        </p>

        {success.isAuthenticated ? (
          <p className="text-green-700 font-medium">
            Fully authenticated – no physical signature required.
          </p>
        ) : (
          <p className="text-orange-600 font-medium">
            Please sign the physical form / notebook with your order number and
            total.
          </p>
        )}

        <button
          onClick={() => router.push("/edit")}
          className="mt-8 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Modify my order
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow p-6 space-y-6"
    >
      {/* Employee details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Employee ID</label>
          <input
            type="text"
            value={employeeId}
            onChange={(e) => {
              setEmployeeId(e.target.value);
              setNameLocked(false);
            }}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={employeeName}
            onChange={(e) => {
              setEmployeeName(e.target.value);
              setNameLocked(false);
            }}
            className="w-full border rounded px-3 py-2"
            disabled={nameLocked}
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
            placeholder="For full validation"
          />
        </div>
      </div>

     <div className="flex gap-3 items-start">
  <button
    type="button"
    onClick={handleLookup}
    className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 text-sm"
  >
    Lookup Employee
  </button>

  <div className="flex-1">
    {lookupMessage && (
      <p className="text-sm text-blue-700 mb-2">{lookupMessage}</p>
    )}

    {matches.length > 0 && (
      <div className="border rounded bg-gray-50 p-3 space-y-2">
        {matches.map((match) => (
          <button
            key={match.employeeId}
            type="button"
            onClick={() => selectMatch(match)}
            className="block w-full text-left px-3 py-2 rounded hover:bg-blue-100"
          >
            <span className="font-medium">{match.fullName}</span>
            <span className="text-gray-500 text-sm ml-2">
              (ID: {match.employeeId})
            </span>
          </button>
        ))}
      </div>
    )}
  </div>
</div>

      {/* Products */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Products</h2>

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
              {product.description && (
                <div className="text-sm text-gray-500">
                  {product.description}
                </div>
              )}
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
                    product.maxQty,
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

      {/* Grand total */}
      <div className="flex justify-between items-center text-xl font-bold border-t pt-4">
        <span>Total</span>
        <span>${grandTotal.toFixed(2)}</span>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Order"}
      </button>
    </form>
  );
}
