"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Shield, LogOut, Terminal, Gamepad2, Trophy, Users, LayoutDashboard, Sun, Moon } from "lucide-react";
import { AdminMobileToggle } from "./AdminMobileToggle";
import { useTheme } from "@/components/ThemeProvider";

interface AdminTopBarProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    rank?: string | null;
    role?: string | null;
  } | null;
}

export function AdminTopBar({ user }: AdminTopBarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { theme, toggle: toggleTheme } = useTheme();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const roleLabel = user?.role === "SUPERADMIN" ? "Superadmin" : user?.role === "MODERATOR" ? "Moderator" : "Staff";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/45 px-4 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <div className="lg:hidden">
          <AdminMobileToggle />
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <Terminal className="h-4.5 w-4.5 text-red-500" />
          <span className="font-display text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Admin Operations Command</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((open) => !open)}
              className="flex items-center gap-2 rounded-[1rem] border border-border bg-muted/40 px-2 py-1.5 transition-all hover:border-red-500/20 hover:bg-muted/80 sm:gap-3 sm:rounded-[1.5rem] sm:px-2.5 sm:py-2 cursor-pointer"
            >
              <div className="hidden text-right lg:block">
                <div className="text-[13px] font-black uppercase tracking-[0.08em] text-foreground">{user.name}</div>
                <div className="mt-1 flex items-center justify-end gap-1 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-red-400">
                  <Shield className="h-3 w-3" />
                  <span>{roleLabel}</span>
                </div>
              </div>
              <div className="rounded-full bg-[linear-gradient(135deg,#f87171,#ef4444)] p-[2px] shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-background text-sm font-black text-red-500 sm:h-10 sm:w-10">
                  {user.image ? (
                    <img src={user.image} alt="User" className="h-full w-full object-cover" />
                  ) : (
                    user.name?.charAt(0) || "A"
                  )}
                </div>
              </div>
            </button>

            {profileOpen ? (
              <div className="dropdown-panel absolute right-0 top-full z-50 mt-3 w-[min(19rem,calc(100vw-1rem))] rounded-xl border border-border p-2 shadow-[0_26px_80px_-40px_rgba(0,0,0,0.98)] backdrop-blur-2xl sm:w-[19rem]">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-[linear-gradient(135deg,#f87171,#ef4444)] p-[2px]">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-background text-lg font-black text-red-500">
                        {user.image ? (
                          <img src={user.image} alt="User" className="h-full w-full object-cover" />
                        ) : (
                          user.name?.charAt(0) || "A"
                        )}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-display text-lg font-black uppercase tracking-[0.08em] text-foreground">{user.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <Link href="/profile" onClick={() => setProfileOpen(false)} className="action-button-primary mt-4 w-full justify-center text-[11px] bg-red-600 hover:bg-red-500 text-white border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.25)]">
                    View Player Profile
                  </Link>
                </div>

                  <div className="mt-2 space-y-1">
                    {/* Theme Toggle row */}
                    <button
                      onClick={toggleTheme}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-red-400 cursor-pointer text-left"
                    >
                      {theme === "dark" ? (
                        <>
                          <Sun className="h-4 w-4 text-red-400" />
                          <span>Light Theme</span>
                        </>
                      ) : (
                        <>
                          <Moon className="h-4 w-4 text-red-400" />
                          <span>Dark Theme</span>
                        </>
                      )}
                    </button>

                    <Link href="/home" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-red-400">
                      <Gamepad2 className="h-4 w-4 text-red-400" />
                      Player Hub (Homepage)
                    </Link>
                    <Link href="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-red-400">
                      <Shield className="h-4 w-4 text-red-400" />
                      Admin Control Grid
                    </Link>
                    <Link href="/tournaments" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-red-400">
                      <Trophy className="h-4 w-4 text-red-400" />
                      Tournament Board
                    </Link>
                    <Link href="/chat" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-red-400">
                      <Users className="h-4 w-4 text-red-400" />
                      Team Chat
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-400/10 cursor-pointer"
                    >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
