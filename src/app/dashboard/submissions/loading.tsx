import { SelectorSkeleton, MetricCardSkeleton, TableSkeleton } from "@/components/Skeleton";

export default function SubmissionsLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-4 w-20 bg-zinc-800 rounded mb-1" />
        <div className="h-6 w-44 bg-zinc-800 rounded" />
      </div>
      <SelectorSkeleton />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
      <TableSkeleton rows={5} />
    </div>
  );
}
