"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  BarChart2,
  Calendar,
  LayoutDashboard,
  MessageSquare,
  Swords,
  Trophy,
  User,
  Users,
  X,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarProvider";

const navGroups = [
  {
    label: "Compete",
    items: [
      { name: "Dashboard", href: "/home", icon: LayoutDashboard },
      { name: "Tournaments", href: "/tournaments", icon: Trophy },
      { name: "Scrimmage", href: "/scrims", icon: Swords },
      { name: "Events", href: "/events", icon: Calendar },
      { name: "Leaderboard", href: "/leaderboard", icon: BarChart2 },
    ],
  },
  {
    label: "Community",
    items: [
      { name: "Arena Feed", href: "/feed", icon: Flame },
      { name: "My Team", href: "/teams/my-team", icon: Users },
      { name: "Communications", href: "/chat", icon: MessageSquare },
    ],
  },
  {
    label: "You",
    items: [{ name: "Profile", href: "/profile", icon: User }],
  },
];

interface SidebarProps {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    rank?: string | null;
    role?: string | null;
    level?: number | null;
    xpPercentage?: number | null;
  } | null;
  logoUrl?: string;
}

export function Sidebar({ user, logoUrl = "/ch-logo.png" }: SidebarProps) {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchFriends = async () => {
      try {
        const res = await fetch("/api/social/friends", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setFriends(data.friends || []);
        }
      } catch {}
    };
    fetchFriends();
    // Poll friends status list every 10 seconds
    const interval = setInterval(fetchFriends, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const xp = user?.xpPercentage != null ? Math.round(user.xpPercentage) : 0;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/75 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={close}
      />

      <aside
        className={cn(
          "sidebar-panel fixed inset-y-0 left-0 z-50 flex w-[min(86vw,300px)] flex-shrink-0 flex-col overflow-hidden border-r border-border backdrop-blur-2xl transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:w-[256px] lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Gold edge running down the right side */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-primary/40 via-primary/5 to-transparent" />

        {/* Brand row */}
        <div className="relative flex h-[72px] flex-shrink-0 items-center gap-3 px-5">
          <Link href="/home" className="group flex min-w-0 items-center gap-3" onClick={close}>
            <img
              src={logoUrl}
              alt="Community Heroes"
              className="h-11 w-11 flex-shrink-0 object-contain drop-shadow-[0_0_12px_rgba(242,193,78,0.25)] transition-transform duration-300 group-hover:scale-105"
            />
            <div className="min-w-0 leading-none">
              <div className="font-display text-[15px] font-bold tracking-[0.12em] text-foreground">Community</div>
              <div className="font-display text-[15px] font-bold tracking-[0.12em] text-primary">Heroes</div>
            </div>
          </Link>
          <button
            aria-label="Close menu"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground lg:hidden"
            onClick={close}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Player card */}
        {user && (
          <Link
            href="/profile"
            onClick={close}
            className="group relative mx-3 mb-2 block overflow-hidden rounded-xl border border-border bg-gradient-to-br from-white/[0.05] to-transparent p-3 transition-colors hover:border-primary/30"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border border-primary/30 bg-muted">
                  {user.image ? (
                    <img src={user.image} className="h-full w-full object-cover" alt="" />
                  ) : (
                    <span className="font-display text-lg font-bold text-primary">{user.name?.charAt(0) || "G"}</span>
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-foreground">{user.name || "Gamer"}</div>
                <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{user.rank || "Unranked"}</div>
              </div>
              <div
                className="flex h-9 w-9 flex-shrink-0 flex-col items-center justify-center bg-primary/10 text-primary"
                style={{ clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)" }}
                title="Level"
              >
                <span className="text-[7px] font-bold uppercase leading-none tracking-wider opacity-70">Lv</span>
                <span className="font-display text-[13px] font-bold leading-none">{user.level ?? "–"}</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <span>Season XP</span>
                <span className="text-primary">{xp}%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-[image:var(--gradient-primary)] shadow-[0_0_8px_rgba(242,193,78,0.6)] transition-all duration-700 ease-out"
                  style={{ width: `${xp}%` }}
                />
              </div>
            </div>
          </Link>
        )}

        <nav className="custom-scrollbar relative flex-1 overflow-y-auto px-3 py-2">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <div className="mb-1.5 px-3 text-[9.5px] font-semibold uppercase tracking-[0.26em] text-muted-foreground/70">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/home"
                      ? pathname === "/home"
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={close}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "group relative flex min-h-[42px] items-center gap-3 rounded-lg px-3 text-[13.5px] font-medium transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-primary/[0.14] via-primary/[0.05] to-transparent text-foreground"
                          : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                      )}
                    >
                      {isActive ? (
                        <span className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-primary shadow-[0_0_12px_rgba(242,193,78,0.9)]" />
                      ) : null}
                      <item.icon
                        className={cn(
                          "h-[18px] w-[18px] flex-shrink-0 transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-primary/80"
                        )}
                      />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Online friends */}
        {user && (
          <div className="flex max-h-[200px] flex-shrink-0 flex-col overflow-hidden border-t border-border px-4 py-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]">
            <div className="mb-2 flex flex-shrink-0 items-center justify-between text-[9.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                Online · {friends.length}
              </span>
              <Link href="/chat" onClick={close} className="text-primary hover:underline">
                Manage
              </Link>
            </div>
            <div className="custom-scrollbar flex-1 space-y-0.5 overflow-y-auto">
              {friends.length === 0 ? (
                <div className="px-1 py-1 text-[11px] text-muted-foreground/60">No friends online right now</div>
              ) : (
                friends.map((f) => (
                  <Link
                    key={f.friendshipId}
                    href={`/chat?dm=${f.user.id}`}
                    onClick={close}
                    className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.04]"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-[11px] font-bold text-muted-foreground">
                        {f.user.image ? <img src={f.user.image} className="h-full w-full object-cover" alt="" /> : f.user.name?.charAt(0)}
                      </div>
                      <span className="absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
                    </div>
                    <span className="flex-1 truncate text-[12px] font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                      {f.user.name}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
