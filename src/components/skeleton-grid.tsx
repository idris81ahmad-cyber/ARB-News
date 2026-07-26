import { Card } from '@/components/ui/card';

function SkeletonCard() {
  return (
    <Card className="overflow-hidden" aria-hidden>
      <div className="h-48 animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-3/5 animate-pulse rounded bg-muted" />
      </div>
    </Card>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-live="polite"
      aria-label="Loading articles"
    >
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
      <span className="sr-only">Loading articles…</span>
    </div>
  );
}
