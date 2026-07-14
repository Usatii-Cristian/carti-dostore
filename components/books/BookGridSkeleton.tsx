import { BookCardSkeleton } from "./BookCardSkeleton";

const VARIANT_CLASSES = {
  wide: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
  compact: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
};

export function BookGridSkeleton({
  variant = "wide",
  count = 6,
}: {
  variant?: keyof typeof VARIANT_CLASSES;
  count?: number;
}) {
  return (
    <div
      className={`grid gap-4 sm:gap-5 ${VARIANT_CLASSES[variant]}`}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}
