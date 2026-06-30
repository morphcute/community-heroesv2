"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LayoutDashboard, Settings, Shield, Trophy, Users, X, MessageSquare, Swords, Sun, Moon, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/SidebarProvider";
import { useTheme } from "@/components/ThemeProvider";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Tournaments", href: "/admin/tournaments", icon: Trophy },
  { name: "Teams", href: "/admin/teams", icon: Users },
  { name: "Scrims", href: "/admin/scrims", icon: Swords },
  { name: "Feed Mode", href: "/admin/feed", icon: MessageSquare },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
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

export function AdminSidebar({ user, logoUrl = "/ch-logo.png" }: AdminSidebarProps) {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const { theme } = useTheme();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={close}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-hidden border-r border-border bg-card p-5 shadow-[0_30px_80px_-48px_rgba(0,0,0,1)] backdrop-blur-2xl transition-transform duration-300 ease-out lg:w-64 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute right-[-3rem] top-10 h-32 w-32 rounded-full bg-red-400/16 blur-[72px]" />
          <div className="absolute bottom-12 left-[-2rem] h-24 w-24 rounded-full bg-amber-300/10 blur-[70px]" />
        </div>

        <div className="relative mb-6 flex items-center justify-center">
          <Link href="/admin" className="flex flex-col items-center justify-center transition-transform duration-300 hover:scale-[1.02]" onClick={close}>
            <img 
              src={logoUrl} 
              alt="CH Admin" 
              className="h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-transform duration-500 hover:scale-105 lg:h-24" 
            />
          </Link>
          <button
            onClick={close}
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-xl border border-border bg-muted p-2 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Profile Progress Banner */}
        {user && (
          <div className="mb-4 p-3 rounded-xl bg-muted/40 border border-border relative overflow-hidden">
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-muted border border-border flex items-center justify-center shadow-md">
                  {user.image ? (
                    <img src={user.image} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <User className="w-4 h-4 text-primary" />
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-black text-foreground truncate uppercase tracking-wider">{user.name || "Gamer"}</div>
                <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                  <span className="text-primary font-black">Rank:</span> {user.rank || "Rookie"}
                </div>
              </div>
            </div>
            {/* Level / XP Progress bar */}
            <div className="mt-2.5 relative z-10">
              <div className="flex justify-between items-center text-[8px] text-muted-foreground font-black uppercase tracking-wider mb-1">
                <span>Rank Progression</span>
                {user.level != null ? (
                  <span className="text-primary">LVL {user.level}</span>
                ) : (
                  <span className="text-primary">—</span>
                )}
              </div>
              <div className="h-1 bg-background rounded-full overflow-hidden border border-border shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-600 shadow-[0_0_5px_rgba(250,204,21,0.5)] rounded-full transition-all duration-700 ease-out"
                  style={{ width: user.xpPercentage != null ? `${Math.round(user.xpPercentage)}%` : "0%" }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="relative mb-3 px-2 text-[0.62rem] font-black uppercase tracking-[0.26em] text-muted-foreground">Operations</div>
        <nav className="relative flex-grow space-y-1.5 overflow-y-auto no-scrollbar mb-4">
          {navigation.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 transition-all duration-300",
                  isActive
                    ? "border border-red-300/18 bg-red-400/10 text-red-200 shadow-[0_18px_35px_-28px_rgba(248,113,113,0.9)]"
                    : "border border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-300/10 via-transparent to-amber-200/6 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <item.icon className={cn("relative z-10 h-5 w-5", isActive ? "text-red-200" : "text-muted-foreground/60 group-hover:text-red-200")} />
                <span className="relative z-10 text-sm font-semibold">{item.name}</span>
                {isActive ? <ChevronRight className="relative z-10 ml-auto h-4 w-4 text-red-200/70" /> : null}
              </Link>
            );
          })}
        </nav>



        <div className="relative mt-auto rounded-[1.6rem] border border-red-300/14 bg-red-400/8 p-4 shrink-0">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.9)]" />
            <span className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-red-200">Restricted Environment</span>
          </div>
          <p className="text-[11px] leading-5 text-muted-foreground">Platform-critical controls are available from this console.</p>
        </div>
      </aside>
    </>
  );
}
