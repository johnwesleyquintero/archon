import { Skeleton } from "@/components/ui/skeleton";

export function DashboardLoading() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}
