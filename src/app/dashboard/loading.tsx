import { MetricCardSkeleton, TimelineSkeleton, CardSkeleton, StatsCardSkeleton } from "@/components/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-zinc-900 pb-5 animate-pulse">
        <div className="h-4 w-16 bg-zinc-800 rounded mb-2" />
        <div className="h-7 w-40 bg-zinc-800 rounded mb-1" />
        <div className="h-3 w-64 bg-zinc-800 rounded" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 animate-pulse space-y-4">
          <div className="h-4 w-36 bg-zinc-800 rounded" />
          <div className="h-3 w-48 bg-zinc-800 rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between">
                <div className="h-3 w-24 bg-zinc-800 rounded" />
                <div className="h-3 w-20 bg-zinc-800 rounded" />
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full" />
            </div>
          ))}
        </div>
        <StatsCardSkeleton />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 animate-pulse space-y-4">
          <div className="flex justify-between">
            <div className="space-y-1">
              <div className="h-4 w-32 bg-zinc-800 rounded" />
              <div className="h-3 w-48 bg-zinc-800 rounded" />
            </div>
            <div className="h-3 w-16 bg-zinc-800 rounded" />
          </div>
          <div className="divide-y divide-zinc-900">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="py-3 space-y-1.5">
                <div className="h-3 w-3/4 bg-zinc-800 rounded" />
                <div className="h-2.5 w-1/2 bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 animate-pulse space-y-4">
          <div className="space-y-1">
            <div className="h-4 w-28 bg-zinc-800 rounded" />
            <div className="h-3 w-36 bg-zinc-800 rounded" />
          </div>
          <TimelineSkeleton count={3} />
        </div>
      </div>
    </div>
  );
}
