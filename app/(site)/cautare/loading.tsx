import { BookGridSkeleton } from "@/components/books/BookGridSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" aria-hidden="true">
      <div className="mb-8">
        <div className="h-9 w-72 animate-pulse rounded bg-cream-soft" />
        <div className="mt-2 h-4 w-24 animate-pulse rounded bg-cream-soft" />
      </div>
      <BookGridSkeleton variant="wide" />
    </div>
  );
}
