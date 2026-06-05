export default function ExportLoading() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="border-b border-zinc-900 pb-5 animate-pulse">
        <div className="h-4 w-20 bg-zinc-800 rounded mb-1" />
        <div className="h-6 w-36 bg-zinc-800 rounded mb-1" />
        <div className="h-3 w-56 bg-zinc-800 rounded" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 animate-pulse space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-zinc-800 rounded-full" />
                <div className="h-4 w-32 bg-zinc-800 rounded" />
              </div>
              <div className="h-10 w-full bg-zinc-800 rounded-xl" />
              <div className="h-3 w-48 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
        <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 animate-pulse space-y-4 h-fit">
          <div className="h-4 w-28 bg-zinc-800 rounded" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3 w-24 bg-zinc-800 rounded" />
              <div className="h-3 w-12 bg-zinc-800 rounded" />
            </div>
          ))}
          <div className="h-10 w-full bg-zinc-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
