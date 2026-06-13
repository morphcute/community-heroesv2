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
  Zap,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarProvider";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Arena Feed", href: "/feed", icon: Flame },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Tournaments", href: "/tournaments", icon: Trophy },
  { name: "My Team", href: "/teams/my-team", icon: Users },
  { name: "Scrimmage", href: "/scrims", icon: Swords },
  { name: "Communications", href: "/chat", icon: MessageSquare },
  { name: "Leaderboard", href: "/leaderboard", icon: BarChart2 },
  { name: "Profile", href: "/profile", icon: User },
];

interface SidebarProps {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    rank?: string | null;
    role?: string | null;
  } | null;
}

export function Sidebar({ user }: SidebarProps) {
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

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/78 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={close}
      />

      <aside
        className={cn(
          "sidebar-panel fixed inset-y-0 left-0 z-50 flex w-[min(86vw,320px)] flex-shrink-0 flex-col overflow-hidden border-r border-border shadow-[0_30px_80px_-50px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:w-[244px] lg:translate-x-0",
          "bg-[linear-gradient(180deg,rgba(6,10,23,0.98),rgba(8,11,25,0.92))]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-3rem] top-8 h-32 w-32 rounded-none bg-amber-300/10 blur-[70px]" />
          <div className="absolute bottom-20 right-[-2rem] h-28 w-28 rounded-none bg-amber-300/10 blur-[70px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:34px_34px] opacity-20 [mask-image:linear-gradient(180deg,transparent,black_10%,black_85%,transparent)]" />
        </div>

        <div className="relative flex flex-shrink-0 items-center justify-center border-b border-white/10 px-4 pb-5 pt-6 lg:pb-6 lg:pt-8">
          <Link href="/" className="flex flex-col items-center justify-center gap-3 transition-transform duration-300 hover:scale-[1.02]" onClick={close}>
            <div className="flex items-center justify-center p-2 rounded-none bg-white/5 border border-white/10">
              <img src="/ch-logo.png" alt="Community Heroes" className="h-14 w-auto object-contain drop-shadow-[0_0_15px_rgba(250,204,21,0.3)] transition-transform duration-500 hover:scale-105 lg:h-16" />
            </div>
            <div className="text-center">
              <div className="font-display text-[0.68rem] font-black uppercase tracking-[0.34em] text-primary">Community Heroes</div>
            </div>
          </Link>
          <button className="absolute right-4 top-4 rounded-none bg-white/5 p-1.5 text-gray-500 transition-colors hover:text-white lg:hidden" onClick={close}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Player Profile Banner */}
        {user && (
          <div className="mx-4 my-4 p-3.5 rounded-xl bg-gradient-to-b from-black/60 to-black/30 border border-yellow-500/10 relative overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 border border-yellow-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.15)]">
                  {user.image ? (
                    <img src={user.image} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <User className="w-4 h-4 text-primary" />
                  )}
                </div>
                {/* Active online status indicator */}
                <span className="absolute bottom-[-1px] right-[-1px] w-2.5 h-2.5 bg-green-500 rounded-full border border-black shadow-[0_0_5px_#22c55e]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-black text-white truncate uppercase tracking-wider">{user.name || "Gamer"}</div>
                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                  <span className="text-primary font-black">Rank:</span> {user.rank || "Rookie"}
                </div>
              </div>
            </div>
            {/* Level / XP Progress bar */}
            <div className="mt-3 relative z-10">
              <div className="flex justify-between items-center text-[8px] text-gray-600 font-black uppercase tracking-wider mb-1">
                <span>Rank Progression</span>
                <span className="text-primary">LVL 24</span>
              </div>
              <div className="h-1 bg-black/60 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-600 shadow-[0_0_5px_rgba(250,204,21,0.5)] rounded-full" style={{ width: "65%" }} />
              </div>
            </div>
          </div>
        )}

        <nav className="custom-scrollbar relative flex-1 space-y-1.5 overflow-y-auto px-3 py-3">
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={close}
                className={cn(
                  "group relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3 text-[13px] font-bold tracking-wide transition-all duration-300 border",
                  isActive
                    ? "bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent text-primary border-yellow-500/25 shadow-[0_0_15px_rgba(250,204,21,0.05)]"
                    : "text-slate-400 border-transparent hover:bg-white/[0.03] hover:text-white hover:border-white/5 hover:translate-x-1"
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 transition-opacity duration-300",
                    isActive ? "opacity-100" : "group-hover:opacity-100"
                  )}
                  aria-hidden="true"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/12 via-transparent to-primary/4" />
                </div>
                {isActive ? (
                  <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                ) : null}
                <item.icon
                  className={cn(
                    "relative z-10 h-[18px] w-[18px] flex-shrink-0 transition-all",
                    isActive ? "text-primary drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" : "text-slate-500 group-hover:scale-105 group-hover:text-primary/80"
                  )}
                />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Live Friends List Panel */}
        {user && (
          <div className="border-t border-white/10 px-4 py-3.5 flex flex-col max-h-[220px] overflow-hidden flex-shrink-0">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center justify-between flex-shrink-0">
              <span>Online Friends ({friends.length})</span>
              <Link href="/chat" onClick={close} className="text-primary hover:underline font-bold text-[8px] tracking-wide uppercase">Manage</Link>
            </div>
            <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 pr-0.5">
              {friends.length === 0 ? (
                <div className="text-[10px] text-slate-600 italic py-1 px-1">No friends online</div>
              ) : (
                friends.map(f => (
                  <Link
                    key={f.friendshipId}
                    href={`/chat?dm=${f.user.id}`}
                    onClick={close}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/[0.03] rounded-lg transition-colors group"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-gray-400 font-bold group-hover:border-primary/40 transition-colors">
                        {f.user.image ? <img src={f.user.image} className="w-full h-full object-cover" alt="" /> : f.user.name?.charAt(0)}
                      </div>
                      <span className="absolute bottom-[-1px] right-[-1px] w-2 h-2 bg-green-500 rounded-full border border-black shadow-[0_0_3px_#22c55e]" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-white truncate transition-colors flex-1">{f.user.name}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

        <div className="border-t border-white/10 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] lg:pb-4 flex-shrink-0">
          <div className="rounded-none border border-white/10 bg-white/6 px-4 py-3">
            <div className="mb-2 flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-[0.62rem] font-black uppercase tracking-[0.26em] text-primary">Live Arena Mode</span>
            </div>
            <div className="text-[10px] text-slate-500">Community Heroes © 2026</div>
          </div>
        </div>
      </aside>
    </>
  );
}
