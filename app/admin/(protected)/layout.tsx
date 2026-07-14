import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const adminEmail = session?.user?.email;

  return (
    <div className="admin-scope flex min-h-screen bg-slate-50">
      <AdminSidebar adminEmail={adminEmail} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminMobileNav adminEmail={adminEmail} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
