function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface-container ${className}`}
      aria-hidden
    />
  );
}

export default function DashboardLoading() {
  return (
    <div className="space-y-10 px-6 py-8">
      <Skeleton className="h-44 w-full rounded-2xl" />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-9 w-72" />

      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-xl" />
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
