import { SkeletonLine, SkeletonImage, SkeletonCircle } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 animate-in fade-in duration-300">
      <SkeletonLine className="w-56 h-8 mb-8" />
      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-card/50 p-6 flex flex-col md:flex-row gap-6" style={{ animationDelay: `${i * 100}ms` }}>
            <SkeletonImage className="w-full md:w-64 h-40 rounded-xl" />
            <div className="flex-1 space-y-3">
              <SkeletonLine className="w-48 h-6" />
              <SkeletonLine className="w-full h-3" />
              <SkeletonLine className="w-3/4 h-3" />
              <div className="flex gap-4 pt-2">
                <SkeletonLine className="w-24 h-4" />
                <SkeletonLine className="w-24 h-4" />
              </div>
            </div>
            <SkeletonLine className="w-full md:w-32 h-10 rounded-xl self-center" />
          </div>
        ))}
      </div>
    </div>
  );
}
