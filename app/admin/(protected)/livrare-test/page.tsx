import type { Metadata } from "next";
import { FanTestPanel } from "@/components/admin/FanTestPanel";

export const metadata: Metadata = { title: "Test livrare — Admin Dostore Cărți" };

export default function FanTestPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Test livrare</h1>
      <FanTestPanel />
    </div>
  );
}
