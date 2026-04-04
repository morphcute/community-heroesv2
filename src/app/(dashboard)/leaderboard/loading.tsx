import { SkeletonTable, SkeletonLine, SkeletonCircle } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 animate-in fade-in duration-300">
      <SkeletonLine className="w-56 h-8 mb-8" />

      {/* Top 3 Podium Skeleton */}
      <div className="grid grid-cols-3 gap-4 lg:gap-6 max-w-3xl mx-auto mb-10">
        {[2, 1, 3].map((rank) => (
          <div
            key={rank}
            className="flex flex-col items-center p-4 lg:p-6 rounded-2xl border border-white/5 bg-card/50 space-y-3"
            style={{ marginTop: rank === 1 ? "0" : "1.5rem" }}
          >
            <SkeletonCircle className="w-12 h-12 lg:w-16 lg:h-16" />
            <SkeletonLine className="w-16 h-4" />
            <SkeletonLine className="w-12 h-5" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <SkeletonTable rows={7} cols={5} />
    </div>
  );
}
