export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" aria-hidden="true">
      <div className="h-9 w-40 animate-pulse rounded bg-cream-soft" />
      <div className="mt-2 h-4 w-72 animate-pulse rounded bg-cream-soft" />

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-3 rounded-xl bg-card p-5 shadow-sm ring-1 ring-border/70"
          >
            <div className="h-14 w-14 animate-pulse rounded-full bg-cream-soft" />
            <div className="h-3.5 w-16 animate-pulse rounded bg-cream-soft" />
          </div>
        ))}
      </div>
    </div>
  );
}
