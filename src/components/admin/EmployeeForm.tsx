"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type EmployeeFormProps = {
  initialData?: {
    id: string;
    employeeId: string;
    fullName: string;
    isActive: boolean;
    hasPin: boolean;
  };
};

export function EmployeeForm({ initialData }: EmployeeFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [employeeId, setEmployeeId] = useState(initialData?.employeeId ?? "");
  const [fullName, setFullName] = useState(initialData?.fullName ?? "");
  const [pin, setPin] = useState("");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      employeeId,
      fullName,
      pin: pin || undefined,
      isActive,
    };

    const url = isEditing
      ? `/api/admin/employees/${initialData.id}`
      : `/api/admin/employees`;

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

    router.push("/admin/employees");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium mb-1">Employee ID</label>
        <input
          type="text"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
          disabled={isEditing} // usually we don't allow changing the ID
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {isEditing ? "New PIN (leave blank to keep current)" : "PIN (optional)"}
        </label>
        <input
          type="text"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder={isEditing && initialData?.hasPin ? "••••" : "e.g. 1234"}
        />
        <p className="text-xs text-gray-500 mt-1">
          Recommended: 4–6 digits. Leave empty if the employee will use the physical signature method.
        </p>
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
          {loading ? "Saving..." : isEditing ? "Update Employee" : "Create Employee"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/employees")}
          className="border px-4 py-2 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}