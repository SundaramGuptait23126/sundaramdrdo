import { Skeleton } from "@/components/ui/skeleton";

const PropertyCardSkeleton = () => (
  <div className="overflow-hidden rounded-xl border bg-card shadow-card">
    <Skeleton className="aspect-[4/3] w-full" />
    <div className="p-3.5 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-6 w-1/3 mt-2" />
      <div className="flex gap-3 mt-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  </div>
);

export default PropertyCardSkeleton;
