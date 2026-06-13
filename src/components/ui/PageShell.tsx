import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageShellProps = {
  children: ReactNode;
  className?: string;
  size?: "default" | "wide" | "full";
  tone?: "gold" | "blue" | "danger";
};

type PageHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  stats?: Array<{
    label: string;
    value: ReactNode;
  }>;
  aside?: ReactNode;
  className?: string;
};

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
  tone?: "default" | "gold" | "blue" | "danger";
};

type EmptyStateProps = {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

const shellSizes = {
  default: "max-w-7xl",
  wide: "max-w-[1600px]",
  full: "max-w-none",
} as const;

const surfaceTones = {
  default: "before:from-white/12 before:to-white/0",
  gold: "before:from-amber-300/20 before:to-transparent",
  blue: "before:from-cyan-300/20 before:to-transparent",
  danger: "before:from-rose-300/20 before:to-transparent",
} as const;

const shellTones = {
  gold: "from-amber-300/12 via-yellow-400/6 to-transparent",
  blue: "from-cyan-300/12 via-sky-400/6 to-transparent",
  danger: "from-rose-300/12 via-red-400/6 to-transparent",
} as const;

export function PageShell({
  children,
  className,
  size = "default",
  tone = "gold",
}: PageShellProps) {
  return (
    <section className={cn("page-shell", className)}>
      <div className="page-shell__backdrop">
        <div className={cn("page-shell__orb left-[-10%] top-[-4rem] bg-gradient-to-br", shellTones[tone])} />
        <div className="page-shell__orb bottom-[-8rem] right-[-6%] bg-gradient-to-br from-white/8 via-white/2 to-transparent" />
        <div className="page-shell__mesh" />
      </div>
      <div className={cn("page-shell__content", shellSizes[size])}>{children}</div>
    </section>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  icon,
  actions,
  stats,
  aside,
  className,
}: PageHeroProps) {
  return (
    <header className={cn("page-hero", className)}>
      <div className="page-hero__copy">
        {(eyebrow || icon) && (
          <div className="page-hero__eyebrow">
            {icon ? <span className="page-hero__icon">{icon}</span> : null}
            {eyebrow ? <span>{eyebrow}</span> : null}
          </div>
        )}
        <div className="space-y-3">
          <h1 className="page-hero__title">{title}</h1>
          {description ? <p className="page-hero__description">{description}</p> : null}
        </div>
        {stats?.length ? (
          <div className="page-hero__stats">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-chip">
                <span className="stat-chip__label">{stat.label}</span>
                <span className="stat-chip__value">{stat.value}</span>
              </div>
            ))}
          </div>
        ) : null}
        {actions ? <div className="page-hero__actions">{actions}</div> : null}
      </div>
      {aside ? <div className="page-hero__aside">{aside}</div> : null}
    </header>
  );
}

export function SurfaceCard({
  children,
  className,
  tone = "default",
}: SurfaceCardProps) {
  return (
    <div
      className={cn(
        "hud-panel before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r",
        surfaceTones[tone],
        className
      )}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("hud-panel flex flex-col items-center justify-center gap-4 px-6 py-14 text-center", className)}>
      {icon ? <div className="flex h-16 w-16 items-center justify-center rounded-none border border-white/10 bg-white/5 text-primary">{icon}</div> : null}
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-black uppercase tracking-[0.12em] text-white">{title}</h2>
        {description ? <p className="mx-auto max-w-lg text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
