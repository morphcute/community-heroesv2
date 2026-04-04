"use client";

import Link from "next/link";
import { Bell, Gamepad2, LogOut, Menu, Search, Shield, Trophy, Users } from "lucide-react";
import { useSidebar } from "./SidebarProvider";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";

interface TopBarProps {
  user?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    rank?: string | null;
    role?: string | null;
    notifications?: Array<{
      id?: string;
      title?: string;
      content?: string;
    }>;
  } | null;
}

export default function TopBar({ user }: TopBarProps) {
  const { toggle } = useSidebar();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setNotifOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = user?.notifications?.length ?? 0;
  const roleLabel =
    user?.role === "SUPERADMIN" || user?.role === "MODERATOR" ? user.role : user?.rank || "Rookie";

  return (
    <div className="sticky top-0 z-30 border-b border-white/10 bg-[linear-gradient(180deg,rgba(5,8,22,0.92),rgba(5,8,22,0.7))] px-3 py-2.5 backdrop-blur-2xl sm:px-4 sm:py-3 lg:px-6">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <button
            onClick={toggle}
            className="rounded-[1rem] border border-white/10 bg-white/6 p-2 text-slate-400 transition-all hover:border-primary/25 hover:text-primary lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>

          <div className="min-w-0 lg:hidden">
            <div className="text-[0.58rem] font-black uppercase tracking-[0.22em] text-primary">Community Heroes</div>
            <div className="truncate text-sm font-semibold text-white">{user?.name ? `Welcome back, ${user.name.split(" ")[0]}` : "Player access"}</div>
          </div>

          <div className="hidden items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/6 px-4 py-3 shadow-[0_16px_40px_-32px_rgba(0,0,0,0.95)] md:flex md:min-w-[320px] md:max-w-xl md:flex-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-primary">
              <Search className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-slate-500">Search Players & Events</div>
              <input
                type="text"
                placeholder="Find tournaments, teams, players, and events..."
                className="mt-1 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          {user ? (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((open) => !open)}
                className={`relative rounded-[1rem] border px-2.5 py-2 transition-all sm:rounded-2xl sm:px-3 ${
                  notifOpen
                    ? "border-primary/25 bg-primary/10 text-primary"
                    : "border-white/10 bg-white/6 text-slate-400 hover:border-primary/20 hover:text-primary"
                }`}
              >
                <Bell className="h-[15px] w-[15px] sm:h-4 sm:w-4" />
                {unreadCount > 0 ? (
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(250,204,21,0.8)]" />
                ) : null}
              </button>

              {notifOpen ? (
                <div className="absolute right-0 top-full z-50 mt-3 w-[min(20rem,calc(100vw-1.5rem))] rounded-[1.35rem] border border-white/10 bg-[linear-gradient(180deg,rgba(7,10,24,0.98),rgba(9,13,28,0.94))] p-2 shadow-[0_26px_80px_-40px_rgba(0,0,0,0.98)] backdrop-blur-2xl sm:w-80 sm:rounded-[1.6rem]">
                  <div className="mb-1 flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                    <div>
                      <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-primary">Pulse Feed</div>
                      <div className="mt-1 text-sm font-bold text-white">Notifications</div>
                    </div>
                    <div className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-[0.2em] text-primary">
                      {unreadCount}
                    </div>
                  </div>
                  <div className="custom-scrollbar max-h-72 overflow-y-auto p-1">
                    {unreadCount === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-500">
                        No new updates right now.
                      </div>
                    ) : (
                      user.notifications?.map((notification, index) => (
                        <div key={notification.id ?? `${notification.title}-${index}`} className="mb-2 rounded-2xl border border-white/8 bg-white/4 p-4 transition-colors hover:border-primary/20 hover:bg-white/7">
                          <div className="text-xs font-black uppercase tracking-[0.18em] text-primary">
                            {notification.title || "Notification"}
                          </div>
                          <div className="mt-2 text-sm text-slate-300">{notification.content || "Update received."}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((open) => !open)}
                className="flex items-center gap-2 rounded-[1rem] border border-white/10 bg-white/6 px-2 py-1.5 transition-all hover:border-primary/20 hover:bg-white/8 sm:gap-3 sm:rounded-[1.5rem] sm:px-2.5 sm:py-2"
              >
                <div className="hidden text-right lg:block">
                  <div className="text-[13px] font-black uppercase tracking-[0.08em] text-white">{user.name}</div>
                  <div className="mt-1 flex items-center justify-end gap-1 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-slate-500">
                    {user.role === "SUPERADMIN" || user.role === "MODERATOR" ? <Shield className="h-3 w-3 text-primary" /> : <Gamepad2 className="h-3 w-3 text-cyan-300" />}
                    <span>{roleLabel}</span>
                  </div>
                </div>
                <div className="rounded-full bg-[linear-gradient(135deg,#fef08a,#f59e0b)] p-[2px] shadow-[0_0_18px_rgba(250,204,21,0.22)]">
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#07101f] text-sm font-black text-primary sm:h-10 sm:w-10">
                    {user.image ? (
                      <img src={user.image} alt="User" className="h-full w-full object-cover" />
                    ) : (
                      user.name?.charAt(0) || "P"
                    )}
                  </div>
                </div>
              </button>

              {profileOpen ? (
                <div className="absolute right-0 top-full z-50 mt-3 w-[min(19rem,calc(100vw-1rem))] rounded-[1.35rem] border border-white/10 bg-[linear-gradient(180deg,rgba(7,10,24,0.98),rgba(9,13,28,0.94))] p-2 shadow-[0_26px_80px_-40px_rgba(0,0,0,0.98)] backdrop-blur-2xl sm:w-[19rem] sm:rounded-[1.6rem]">
                  <div className="rounded-[1.35rem] border border-white/8 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.16),transparent_34%),rgba(255,255,255,0.04)] p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-[linear-gradient(135deg,#a5f3fc,#60a5fa)] p-[2px]">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#07101f] text-lg font-black text-cyan-300">
                          {user.image ? (
                            <img src={user.image} alt="User" className="h-full w-full object-cover" />
                          ) : (
                            user.name?.charAt(0) || "P"
                          )}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-display text-lg font-black uppercase tracking-[0.08em] text-white">{user.name}</div>
                        <div className="truncate text-xs text-slate-400">{user.email}</div>
                      </div>
                    </div>
                    <Link href="/profile" onClick={() => setProfileOpen(false)} className="action-button-primary mt-4 w-full justify-center text-[11px]">
                      View Player Profile
                    </Link>
                  </div>

                  <div className="mt-2 space-y-1">
                    {(user.role === "SUPERADMIN" || user.role === "MODERATOR") && (
                      <Link href="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/6 hover:text-primary">
                        <Shield className="h-4 w-4 text-primary" />
                        Admin Terminal
                      </Link>
                    )}
                    <Link href="/tournaments" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/6 hover:text-primary">
                      <Trophy className="h-4 w-4 text-primary" />
                      Tournament Board
                    </Link>
                    <Link href="/chat" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/6 hover:text-primary">
                      <Users className="h-4 w-4 text-cyan-300" />
                      Team Chat
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-400/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <Link href="/login" className="action-button-primary text-[11px]">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
