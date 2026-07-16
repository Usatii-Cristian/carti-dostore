export function BookCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-cream ring-1 ring-border/50">
      <div className="aspect-square w-full animate-pulse bg-cream-soft" />
      <div className="flex flex-col gap-2 p-3.5">
        <div className="h-3.5 w-4/5 animate-pulse rounded bg-cream-soft" />
        <div className="h-3 w-2/5 animate-pulse rounded bg-cream-soft" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-cream-soft" />
        <div className="mt-1 flex items-center justify-between">
          <div className="h-4 w-14 animate-pulse rounded bg-cream-soft" />
          <div className="h-9 w-9 animate-pulse rounded-full bg-cream-soft" />
        </div>
      </div>
    </div>
  );
}
