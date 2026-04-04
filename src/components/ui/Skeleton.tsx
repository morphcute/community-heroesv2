export function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div className={`h-4 rounded-lg bg-white/5 animate-skeleton-shimmer relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-skeleton-wave" />
    </div>
  );
}

export function SkeletonCircle({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <div className={`rounded-full bg-white/5 animate-skeleton-pulse ${className}`} />
  );
}

export function SkeletonCard({ className = "", children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border border-white/5 bg-card/50 p-6 animate-skeleton-pulse ${className}`}>
      {children || (
        <div className="space-y-4">
          <SkeletonLine className="w-3/4 h-5" />
          <SkeletonLine className="w-1/2 h-3" />
          <SkeletonLine className="w-full h-3" />
          <SkeletonLine className="w-2/3 h-3" />
        </div>
      )}
    </div>
  );
}

export function SkeletonImage({ className = "h-48" }: { className?: string }) {
  return (
    <div className={`rounded-xl bg-white/5 animate-skeleton-pulse relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-card/50 overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-4 bg-white/[0.02] border-b border-white/5">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonLine key={`h-${i}`} className="flex-1 h-3" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 p-4 border-b border-white/[0.03] items-center" style={{ animationDelay: `${r * 100}ms` }}>
          <SkeletonCircle className="w-8 h-8 flex-shrink-0" />
          {Array.from({ length: cols - 1 }).map((_, c) => (
            <SkeletonLine key={`${r}-${c}`} className="flex-1 h-3" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonHero({ className = "h-[400px]" }: { className?: string }) {
  return (
    <div className={`rounded-3xl bg-white/[0.03] border border-white/5 relative overflow-hidden animate-skeleton-pulse ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent" />
      <div className="absolute bottom-8 left-8 space-y-4 w-1/2">
        <SkeletonLine className="w-24 h-5" />
        <SkeletonLine className="w-3/4 h-8" />
        <SkeletonLine className="w-1/2 h-4" />
        <SkeletonLine className="w-32 h-10 rounded-xl" />
      </div>
    </div>
  );
}
