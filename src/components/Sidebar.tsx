"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarProvider";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Tournaments", href: "/tournaments", icon: Trophy },
  { name: "My Team", href: "/teams/my-team", icon: Users },
  { name: "Scrimmage", href: "/scrims", icon: Swords },
  { name: "Communications", href: "/chat", icon: MessageSquare },
  { name: "Leaderboard", href: "/leaderboard", icon: BarChart2 },
  { name: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

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
          "fixed inset-y-0 left-0 z-50 flex w-[min(86vw,320px)] flex-shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[linear-gradient(180deg,rgba(6,10,23,0.98),rgba(8,11,25,0.92))] shadow-[0_30px_80px_-50px_rgba(0,0,0,1)] backdrop-blur-2xl transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:w-[244px] lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-3rem] top-8 h-32 w-32 rounded-full bg-amber-300/10 blur-[70px]" />
          <div className="absolute bottom-20 right-[-2rem] h-28 w-28 rounded-full bg-cyan-300/10 blur-[70px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:34px_34px] opacity-20 [mask-image:linear-gradient(180deg,transparent,black_10%,black_85%,transparent)]" />
        </div>

        <div className="relative flex flex-shrink-0 items-center justify-center border-b border-white/10 px-4 pb-5 pt-6 lg:pb-6 lg:pt-8">
          <Link href="/" className="flex flex-col items-center justify-center gap-3 transition-transform duration-300 hover:scale-[1.02]" onClick={close}>
            <div className="flex items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10">
              <img src="/ch-logo.png" alt="Community Heroes" className="h-14 w-auto object-contain drop-shadow-[0_0_15px_rgba(250,204,21,0.3)] transition-transform duration-500 hover:scale-105 lg:h-16" />
            </div>
            <div className="text-center">
              <div className="font-display text-[0.68rem] font-black uppercase tracking-[0.34em] text-primary">Community Heroes</div>
            </div>
          </Link>
          <button className="absolute right-4 top-4 rounded-full bg-white/5 p-1.5 text-gray-500 transition-colors hover:text-white lg:hidden" onClick={close}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="custom-scrollbar relative flex-1 space-y-1 overflow-y-auto px-3 py-4 lg:py-5">
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
                  "group relative flex items-center gap-3 overflow-hidden rounded-[1.15rem] px-3.5 py-3 text-[13px] font-semibold transition-all duration-200 lg:rounded-2xl",
                  isActive
                    ? "bg-primary/10 text-primary shadow-[0_18px_35px_-28px_rgba(250,204,21,0.95)]"
                    : "text-slate-400 hover:bg-white/6 hover:text-white"
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 transition-opacity duration-300",
                    isActive ? "opacity-100" : "group-hover:opacity-100"
                  )}
                  aria-hidden="true"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-cyan-300/8" />
                </div>
                {isActive ? (
                  <div className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_12px_rgba(250,204,21,0.8)]" />
                ) : null}
                <item.icon
                  className={cn(
                    "relative z-10 h-[18px] w-[18px] flex-shrink-0 transition-all",
                    isActive ? "text-primary" : "text-slate-500 group-hover:scale-105 group-hover:text-cyan-200"
                  )}
                />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] lg:pb-4">
          <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
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
