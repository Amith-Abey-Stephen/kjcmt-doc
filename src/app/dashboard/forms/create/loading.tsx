export default function CreateFormLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="animate-pulse">
        <div className="h-4 w-24 bg-zinc-800 rounded mb-1" />
        <div className="h-6 w-40 bg-zinc-800 rounded" />
      </div>
      <div className="glass-card p-8 rounded-2xl bg-zinc-900/40 border border-zinc-900 animate-pulse space-y-6">
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-1 h-2 bg-zinc-800 rounded-full" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-24 bg-zinc-800 rounded" />
              <div className="h-10 w-full bg-zinc-800 rounded-xl" />
            </div>
          ))}
        </div>
        <div className="h-12 w-full bg-zinc-800 rounded-xl" />
      </div>
    </div>
  );
}
