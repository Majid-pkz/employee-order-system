import { AdminNav } from "@/components/admin/AdminNav";

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <main>{children}</main>
    </div>
  );
}