import { SkeletonCard, SkeletonLine, SkeletonImage } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="space-y-2">
          <SkeletonLine className="w-48 h-8" />
          <SkeletonLine className="w-64 h-4" />
        </div>
        <SkeletonLine className="w-full md:w-96 h-12 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-card/50 overflow-hidden" style={{ animationDelay: `${i * 80}ms` }}>
            <SkeletonImage className="h-48" />
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <SkeletonLine className="w-16 h-3" />
                  <SkeletonLine className="w-20 h-5" />
                </div>
                <div className="space-y-1 text-right">
                  <SkeletonLine className="w-12 h-3 ml-auto" />
                  <SkeletonLine className="w-16 h-4 ml-auto" />
                </div>
              </div>
              <SkeletonLine className="w-full h-10 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
