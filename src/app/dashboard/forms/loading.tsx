import { FormCardGridSkeleton } from "@/components/Skeleton";

export default function FormsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-pulse">
        <div className="space-y-1">
          <div className="h-4 w-16 bg-zinc-800 rounded" />
          <div className="h-5 w-32 bg-zinc-800 rounded" />
        </div>
        <div className="h-10 w-32 bg-zinc-800 rounded-xl" />
      </div>
      <FormCardGridSkeleton count={6} />
    </div>
  );
}
