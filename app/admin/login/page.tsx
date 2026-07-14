import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin — Dostore Carti",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white">
            <BookOpen className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="text-xl font-semibold text-slate-900">Dostore Carti Admin</h1>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
