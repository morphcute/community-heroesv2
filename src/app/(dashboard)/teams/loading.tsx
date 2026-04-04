import { SkeletonCard, SkeletonLine, SkeletonCircle } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          <SkeletonLine className="w-32 h-8" />
          <SkeletonLine className="w-56 h-4" />
        </div>
        <SkeletonLine className="w-32 h-10 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-card/50 p-6 space-y-4" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center gap-4">
              <SkeletonCircle className="w-16 h-16 rounded-xl" />
              <div className="space-y-2 flex-1">
                <SkeletonLine className="w-32 h-5" />
                <SkeletonLine className="w-20 h-3" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
              {[1, 2, 3].map((j) => (
                <div key={j} className="text-center space-y-1">
                  <SkeletonLine className="w-12 h-3 mx-auto" />
                  <SkeletonLine className="w-8 h-5 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
