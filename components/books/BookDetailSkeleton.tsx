export function BookDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" aria-hidden="true">
      <div className="mb-6 h-4 w-56 animate-pulse rounded bg-cream-soft" />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div className="aspect-[2/3] w-full animate-pulse rounded-xl bg-cream-soft" />

        <div>
          <div className="h-4 w-32 animate-pulse rounded bg-cream-soft" />
          <div className="mt-3 h-9 w-3/4 animate-pulse rounded bg-cream-soft" />
          <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-cream-soft" />
          <div className="mt-4 h-4 w-40 animate-pulse rounded bg-cream-soft" />
          <div className="mt-5 h-8 w-32 animate-pulse rounded bg-cream-soft" />

          <div className="mt-6 flex gap-3">
            <div className="h-12 w-40 animate-pulse rounded-full bg-cream-soft" />
            <div className="h-12 w-32 animate-pulse rounded-full bg-cream-soft" />
          </div>

          <div className="mt-8 space-y-2 border-t border-border pt-6">
            <div className="h-3.5 w-full animate-pulse rounded bg-cream-soft" />
            <div className="h-3.5 w-5/6 animate-pulse rounded bg-cream-soft" />
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-cream-soft" />
          </div>
        </div>
      </div>
    </div>
  );
}
