import { Truck, ShieldCheck, Undo2, Headset } from "lucide-react";

const BENEFITS = [
  {
    icon: Truck,
    title: "Livrare rapidă",
    description: "Oriunde în Moldova, în 1-3 zile lucrătoare",
  },
  {
    icon: ShieldCheck,
    title: "Plată sigură",
    description: "Online prin VictoriaBank MIA sau la livrare",
  },
  {
    icon: Undo2,
    title: "Retur simplu",
    description: "14 zile pentru a returna o carte necorespunzătoare",
  },
  {
    icon: Headset,
    title: "Suport clienți",
    description: "Răspundem rapid, Luni–Vineri, 09:00–18:00",
  },
];

export function Benefits() {
  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {BENEFITS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream-soft text-terracotta">
              <Icon className="h-5.5 w-5.5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold text-ink">{title}</p>
              <p className="text-sm text-ink-soft">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
