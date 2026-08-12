import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CycleForm } from "@/components/admin/CycleForm";

export default async function NewCyclePage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">Create Order Cycle</h1>
      <CycleForm />
    </div>
  );
}