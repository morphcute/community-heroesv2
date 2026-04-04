import { SkeletonHero, SkeletonCard, SkeletonLine, SkeletonCircle } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Top Section: Hero + User Stats */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SkeletonHero className="h-[300px] lg:h-[400px]" />
        </div>
        <div className="xl:col-span-1 rounded-2xl border border-[#FFD700]/[0.06] bg-[#0d0d0d] p-6 space-y-6">
          <div className="flex items-center gap-4">
            <SkeletonCircle className="w-12 h-12" />
            <div className="flex-1 space-y-2">
              <SkeletonLine className="w-32 h-5" />
              <SkeletonLine className="w-20 h-3" />
            </div>
          </div>
          <SkeletonLine className="w-full h-1.5 rounded-full" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 space-y-2">
                <SkeletonCircle className="w-4 h-4 mx-auto" />
                <SkeletonLine className="w-8 h-4 mx-auto" />
                <SkeletonLine className="w-10 h-2 mx-auto" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
              <SkeletonLine className="w-full h-4" />
            </div>
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
              <SkeletonLine className="w-full h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Hub Cards */}
      <div className="space-y-4">
        <SkeletonLine className="w-48 h-5" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-white/[0.04] bg-[#0d0d0d] overflow-hidden" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="h-24 bg-[#111111]" />
              <div className="p-4 space-y-3">
                <SkeletonLine className="w-20 h-4" />
                <SkeletonLine className="w-full h-3" />
                <SkeletonLine className="w-2/3 h-3" />
                <SkeletonLine className="w-24 h-3 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
