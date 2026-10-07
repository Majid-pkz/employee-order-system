import { requireAdminPage } from "@/lib/access";
import { CycleForm } from "@/components/admin/CycleForm";

export default async function NewCyclePage() {
  await requireAdminPage();

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">Create Order Cycle</h1>
      <CycleForm />
    </div>
  );
}