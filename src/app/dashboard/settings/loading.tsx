import { TimelineSkeleton } from "@/components/Skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-4 w-20 bg-zinc-800 rounded mb-1" />
        <div className="h-6 w-36 bg-zinc-800 rounded" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-zinc-800 rounded-full" />
            <div className="space-y-1.5">
              <div className="h-4 w-28 bg-zinc-800 rounded" />
              <div className="h-3 w-40 bg-zinc-800 rounded" />
            </div>
          </div>
          <div className="h-10 w-full bg-zinc-800 rounded-xl" />
          <div className="h-10 w-full bg-zinc-800 rounded-xl" />
        </div>
        <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 animate-pulse space-y-4">
          <div className="h-4 w-32 bg-zinc-800 rounded" />
          <TimelineSkeleton count={4} />
        </div>
      </div>
    </div>
  );
}
