import type { Metadata } from "next";
import { createPublisher } from "@/lib/actions/admin-publishers";
import { PublisherForm } from "@/components/admin/PublisherForm";

export const metadata: Metadata = { title: "Editură nouă — Admin Dostore Carti" };

export default function NewPublisherPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Editură nouă</h1>
      <PublisherForm action={createPublisher} />
    </div>
  );
}
