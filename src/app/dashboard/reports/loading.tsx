import { SelectorSkeleton, StatsCardSkeleton, TableSkeleton } from "@/components/Skeleton";

export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-4 w-16 bg-zinc-800 rounded mb-1" />
        <div className="h-6 w-40 bg-zinc-800 rounded" />
      </div>
      <div className="flex items-end gap-4 justify-between">
        <SelectorSkeleton />
        <div className="h-10 w-36 bg-zinc-800 rounded-xl" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
      <TableSkeleton rows={6} />
    </div>
  );
}
