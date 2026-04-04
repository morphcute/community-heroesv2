"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LayoutDashboard, Settings, Shield, Trophy, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/SidebarProvider";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Tournaments", href: "/admin/tournaments", icon: Trophy },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

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
          "fixed left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-hidden border-r border-white/10 bg-[linear-gradient(180deg,rgba(20,8,14,0.96),rgba(12,8,18,0.86))] p-5 shadow-[0_30px_80px_-48px_rgba(0,0,0,1)] backdrop-blur-2xl transition-transform duration-300 ease-out lg:w-64 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute right-[-3rem] top-10 h-32 w-32 rounded-full bg-red-400/16 blur-[72px]" />
          <div className="absolute bottom-12 left-[-2rem] h-24 w-24 rounded-full bg-amber-300/10 blur-[70px]" />
        </div>

        <div className="relative mb-8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] border border-red-300/20 bg-[linear-gradient(135deg,rgba(251,113,133,0.3),rgba(239,68,68,0.18))] shadow-[0_18px_30px_-22px_rgba(244,63,94,0.9)]">
              <Shield className="h-5 w-5 text-red-200" />
            </div>
            <div>
              <div className="font-display text-lg font-black uppercase tracking-[0.12em] text-white">CH Admin</div>
              <div className="text-[0.62rem] font-black uppercase tracking-[0.28em] text-red-300">Control Grid</div>
            </div>
          </div>
          <button
            onClick={close}
            className="rounded-xl border border-white/10 bg-white/6 p-2 text-slate-400 transition-colors hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mb-3 px-2 text-[0.62rem] font-black uppercase tracking-[0.26em] text-slate-500">Operations</div>
        <nav className="relative flex-1 space-y-1.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 transition-all duration-300",
                  isActive
                    ? "border border-red-300/18 bg-red-400/10 text-red-200 shadow-[0_18px_35px_-28px_rgba(248,113,113,0.9)]"
                    : "border border-transparent text-slate-400 hover:border-white/10 hover:bg-white/6 hover:text-white"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-300/10 via-transparent to-amber-200/6 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <item.icon className={cn("relative z-10 h-5 w-5", isActive ? "text-red-200" : "text-slate-500 group-hover:text-red-200")} />
                <span className="relative z-10 text-sm font-semibold">{item.name}</span>
                {isActive ? <ChevronRight className="relative z-10 ml-auto h-4 w-4 text-red-200/70" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="relative mt-auto rounded-[1.6rem] border border-red-300/14 bg-red-400/8 p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.9)]" />
            <span className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-red-200">Restricted Environment</span>
          </div>
          <p className="text-[11px] leading-5 text-slate-400">Platform-critical controls are available from this console.</p>
        </div>
      </aside>
    </>
  );
}
