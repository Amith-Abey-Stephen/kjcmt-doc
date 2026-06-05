export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 animate-pulse ${className}`}>
      <div className="space-y-3">
        <div className="h-3 w-16 bg-zinc-800 rounded" />
        <div className="h-4 w-3/4 bg-zinc-800 rounded" />
        <div className="h-3 w-1/2 bg-zinc-800 rounded" />
        <div className="h-2.5 w-full bg-zinc-800 rounded-full mt-4" />
        <div className="flex gap-2 pt-2">
          <div className="h-8 w-20 bg-zinc-800 rounded-lg" />
          <div className="h-8 w-20 bg-zinc-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-card rounded-2xl bg-zinc-900/20 border border-zinc-900 overflow-hidden animate-pulse">
      <div className="border-b border-zinc-900 bg-zinc-950/60 p-4">
        <div className="flex gap-6">
          <div className="h-3 w-24 bg-zinc-800 rounded" />
          <div className="h-3 w-32 bg-zinc-800 rounded" />
          <div className="h-3 w-28 bg-zinc-800 rounded" />
          <div className="h-3 w-36 bg-zinc-800 rounded" />
        </div>
      </div>
      <div className="divide-y divide-zinc-900/60">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 p-4">
            <div className="h-3 w-20 bg-zinc-800 rounded" />
            <div className="h-3 w-28 bg-zinc-800 rounded" />
            <div className="h-3 w-24 bg-zinc-800 rounded" />
            <div className="h-3 w-32 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-2.5 w-20 bg-zinc-800 rounded" />
          <div className="h-7 w-16 bg-zinc-800 rounded" />
          <div className="h-2.5 w-14 bg-zinc-800 rounded" />
        </div>
        <div className="h-9 w-9 bg-zinc-800 rounded-xl" />
      </div>
    </div>
  );
}

export function FormCardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TimelineSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 pl-6">
          <div className="h-2 w-2 rounded-full bg-zinc-800 mt-1.5" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 w-28 bg-zinc-800 rounded" />
            <div className="h-2.5 w-3/4 bg-zinc-800 rounded" />
            <div className="h-2 w-16 bg-zinc-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 animate-pulse">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-2.5 w-28 bg-zinc-800 rounded" />
          <div className="h-4 w-4 bg-zinc-800 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="h-3 w-20 bg-zinc-800 rounded" />
          <div className="h-3 w-12 bg-zinc-800 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="h-3 w-24 bg-zinc-800 rounded" />
          <div className="h-3 w-12 bg-zinc-800 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="h-3 w-22 bg-zinc-800 rounded" />
          <div className="h-3 w-14 bg-zinc-800 rounded" />
        </div>
        <div className="h-2 w-full bg-zinc-800 rounded-full mt-2" />
      </div>
    </div>
  );
}

export function SelectorSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-20 bg-zinc-800 rounded mb-2" />
      <div className="h-10 w-full bg-zinc-800 rounded-xl" />
    </div>
  );
}

export function UserCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-900 flex justify-between items-center">
          <div className="space-y-1.5">
            <div className="h-3 w-24 bg-zinc-800 rounded" />
            <div className="h-2.5 w-32 bg-zinc-800 rounded" />
          </div>
          <div className="h-4 w-14 bg-zinc-800 rounded" />
        </div>
      ))}
    </div>
  );
}
