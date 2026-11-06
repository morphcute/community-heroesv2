"use client";

import Link from "next/link";
import { Bell, Gamepad2, LogOut, Menu, Search, Shield, Trophy, Users, Loader2, X, Sun, Moon } from "lucide-react";
import { useSidebar } from "./SidebarProvider";
import { useEffect, useRef, useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserProfileCard from "@/components/UserProfileCard";
import { sendFriendRequest, acceptFriendRequest, getOrCreateDM } from "@/app/(dashboard)/chat/actions";
import { useTheme } from "./ThemeProvider";
import { markNotificationRead } from "@/app/actions/notifications";

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
      link?: string | null;
    }>;
  } | null;
}

export default function TopBar({ user }: TopBarProps) {
  const router = useRouter();
  const { toggle } = useSidebar();
  const { theme, toggle: toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleNotifClick = async (notifId?: string) => {
    if (!notifId) return;
    await markNotificationRead(notifId);
    setNotifOpen(false);
    router.refresh();
  };

  // Search engine states
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [results, setResults] = useState<{ players: any[]; tournaments: any[]; teams: any[] }>({
    players: [],
    tournaments: [],
    teams: []
  });

  // Global user modal state
  const [selectedUserCard, setSelectedUserCard] = useState<any>(null);
  const [userModalStatus, setUserModalStatus] = useState<"FRIENDS" | "PENDING_SENT" | "PENDING_RECEIVED" | "NONE" | "SELF">("NONE");
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = user?.notifications?.length ?? 0;
  const roleLabel =
    user?.role === "SUPERADMIN" || user?.role === "MODERATOR" ? user.role : user?.rank || "Rookie";

  // Debounced search logic (Facebook style)
  const handleSearch = useCallback((val: string) => {
    setSearchQuery(val);
    const trimmed = val.trim();
    if (!trimmed) {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      setSearching(false);
      setResults({ players: [], tournaments: [], teams: [] });
      setDropdownOpen(false);
      return;
    }

    setSearching(true);
    setDropdownOpen(true);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch {} finally {
        setSearching(false);
      }
    }, 150);
  }, []);

  const clearSearch = () => {
    setSearchQuery("");
    setResults({ players: [], tournaments: [], teams: [] });
    setDropdownOpen(false);
    setSearching(false);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
  };

  // Social modal controls
  const openPlayerCard = async (player: any) => {
    setSelectedUserCard(player);
    setUserModalStatus("NONE");
    setFriendshipId(null);
    if (!user) return;
    if (player.id === user.id) {
      setUserModalStatus("SELF");
      return;
    }
    setSocialLoading(true);
    try {
      const res = await fetch("/api/social/friends", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const friendRec = data.friends.find((f: any) => f.user.id === player.id);
        if (friendRec) {
          setUserModalStatus("FRIENDS");
          setFriendshipId(friendRec.friendshipId);
          return;
        }
        const sentRec = data.pendingSent.find((f: any) => f.user.id === player.id);
        if (sentRec) {
          setUserModalStatus("PENDING_SENT");
          setFriendshipId(sentRec.friendshipId);
          return;
        }
        const receivedRec = data.pendingReceived.find((f: any) => f.user.id === player.id);
        if (receivedRec) {
          setUserModalStatus("PENDING_RECEIVED");
          setFriendshipId(receivedRec.friendshipId);
          return;
        }
      }
    } catch {} finally {
      setSocialLoading(false);
    }
  };

  const handleAddFriendAction = async () => {
    if (!selectedUserCard) return;
    setSocialLoading(true);
    const res = await sendFriendRequest(selectedUserCard.id);
    if (res.ok) {
      await openPlayerCard(selectedUserCard);
    }
    setSocialLoading(false);
  };

  const handleAcceptFriendAction = async () => {
    if (!selectedUserCard || !friendshipId) return;
    setSocialLoading(true);
    const res = await acceptFriendRequest(friendshipId);
    if (res.ok) {
      await openPlayerCard(selectedUserCard);
    }
    setSocialLoading(false);
  };

  const handleSendMessageAction = async () => {
    if (!selectedUserCard) return;
    setSocialLoading(true);
    try {
      await getOrCreateDM(selectedUserCard.id);
      setSelectedUserCard(null);
      clearSearch();
      router.push("/chat");
    } catch {}
    setSocialLoading(false);
  };

  return (
    <div className="topbar-panel sticky top-0 z-30 border-b border-border px-3 backdrop-blur-2xl sm:px-4 lg:px-6">
      <div className="mx-auto flex h-[64px] w-full max-w-[1600px] items-center justify-between gap-3 lg:h-[72px]">
        <div className="flex flex-1 items-center gap-3">
          <button
            onClick={toggle}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white/[0.03] text-muted-foreground transition-all hover:border-primary/30 hover:text-primary lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>

          <div className="min-w-0 lg:hidden">
            <div className="font-display text-[0.7rem] font-bold tracking-[0.2em] text-primary">Community Heroes</div>
            <div className="truncate text-sm font-semibold text-white">{user?.name ? `Welcome back, ${user.name.split(" ")[0]}` : "Player access"}</div>
          </div>

          {/* Interactive Facebook-Style Header Search */}
          <div className="relative hidden md:block md:min-w-[320px] md:max-w-xl md:flex-1" ref={searchRef}>
            <div className="group flex h-11 items-center gap-3 rounded-[var(--radius-control)] border border-border bg-white/[0.03] px-3.5 transition-all focus-within:border-primary/60 focus-within:bg-white/[0.05] focus-within:shadow-[0_0_0_3px_var(--ring-soft)] hover:border-white/15">
              {searching ? (
                <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-primary" />
              ) : (
                <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary" />
              )}
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => { if (searchQuery.trim()) setDropdownOpen(true); }}
                placeholder="Search tournaments, teams, players…"
                aria-label="Search tournaments, teams and players"
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              {!searchQuery && (
                <kbd className="hidden select-none items-center gap-0.5 rounded border border-border bg-white/[0.04] px-1.5 py-0.5 font-sans text-[10px] font-semibold text-muted-foreground lg:inline-flex">
                  ⌘K
                </kbd>
              )}
              {searchQuery && (
                <button 
                  onClick={clearSearch}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Absolute Dropdown Results Portal */}
            {dropdownOpen && (
              <div className="dropdown-panel absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-border p-3 shadow-[0_24px_60px_rgba(0,0,0,0.7)] backdrop-blur-md max-h-[420px] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                {results.tournaments.length > 0 && (
                  <div className="mb-4">
                    <div className="mb-1.5 px-2 text-[9.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Tournaments</div>
                    <div className="space-y-1">
                      {results.tournaments.map(t => (
                        <Link
                          key={t.id}
                          href={`/tournaments/${t.id}`}
                          onClick={clearSearch}
                          className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
                        >
                          <Trophy className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white truncate">{t.title}</div>
                            {t.prizePool && <div className="text-[9px] text-gray-500 font-bold">{t.prizePool}</div>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {results.teams.length > 0 && (
                  <div className="mb-4">
                    <div className="mb-1.5 px-2 text-[9.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Teams</div>
                    <div className="space-y-1">
                      {results.teams.map(team => (
                        <Link
                          key={team.id}
                          href={`/teams/${team.id}`}
                          onClick={clearSearch}
                          className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
                        >
                          <Users className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white truncate">{team.name}</div>
                            {team.description && <div className="text-[9px] text-gray-500 truncate">{team.description}</div>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {results.players.length > 0 && (
                  <div className="mb-2">
                    <div className="mb-1.5 px-2 text-[9.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Players</div>
                    <div className="space-y-1">
                      {results.players.map(p => (
                        <button
                          key={p.id}
                          onClick={() => openPlayerCard(p)}
                          className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.05] transition-colors text-left cursor-pointer"
                        >
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-gray-400 font-bold flex-shrink-0">
                            {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : p.name?.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                              <span>{p.name}</span>
                              {p.rank && <span className="text-[8px] px-1 bg-white/5 text-gray-400 rounded">{p.rank}</span>}
                            </div>
                            {p.mlbbId && <div className="text-[9px] text-gray-500 font-bold">ID: {p.mlbbId}</div>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {results.tournaments.length === 0 && results.teams.length === 0 && results.players.length === 0 && (
                  <div className="text-center py-6 text-xs text-gray-500 italic">
                    No matching tournaments, teams, or players found.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          {user ? (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((open) => !open)}
                aria-label="Notifications"
                className={`relative flex h-10 w-10 items-center justify-center rounded-lg border transition-all ${
                  notifOpen
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-white/[0.03] text-muted-foreground hover:border-primary/30 hover:text-primary"
                }`}
              >
                <Bell className="h-[15px] w-[15px] sm:h-4 sm:w-4" />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-[0_0_12px_rgba(242,193,78,0.7)]">{unreadCount}</span>
                ) : null}
              </button>

              {notifOpen ? (
                <div className="dropdown-panel absolute right-0 top-full z-50 mt-3 w-[min(20rem,calc(100vw-1.5rem))] rounded-xl border border-white/10 p-2 shadow-[0_26px_80px_-40px_rgba(0,0,0,0.98)] backdrop-blur-2xl sm:w-80 sm:rounded-xl">
                  <div className="mb-1 flex items-center justify-between border-b border-border px-3 py-2.5">
                    <div>
                      <div className="text-sm font-semibold text-foreground">Notifications</div>
                    </div>
                    <div className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-[0.2em] text-primary">
                      {unreadCount}
                    </div>
                  </div>
                  <div className="custom-scrollbar max-h-72 overflow-y-auto p-1">
                    {unreadCount === 0 ? (
                      <div className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-500">
                        No new updates right now.
                      </div>
                    ) : (
                      user.notifications?.map((notification, index) => {
                        const contentNode = (
                          <>
                            <div className="text-xs font-black uppercase tracking-[0.18em] text-primary">
                              {notification.title || "Notification"}
                            </div>
                            <div className="mt-2 text-sm text-slate-300">{notification.content || "Update received."}</div>
                          </>
                        );

                        if (notification.link) {
                          return (
                            <Link
                              key={notification.id ?? `${notification.title}-${index}`}
                              href={notification.link}
                              onClick={() => handleNotifClick(notification.id)}
                              className="block mb-2 rounded-xl border border-white/8 bg-white/4 p-4 transition-colors hover:border-primary/20 hover:bg-white/7 cursor-pointer"
                            >
                              {contentNode}
                            </Link>
                          );
                        }

                        return (
                          <div 
                            key={notification.id ?? `${notification.title}-${index}`} 
                            onClick={() => handleNotifClick(notification.id)}
                            className="mb-2 rounded-xl border border-white/8 bg-white/4 p-4 transition-colors hover:border-primary/20 hover:bg-white/7 cursor-pointer"
                          >
                            {contentNode}
                          </div>
                        );
                      })
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
                aria-label="Account menu"
                className="flex items-center gap-3 rounded-lg border border-transparent py-1 pl-1 pr-1 transition-all hover:border-border hover:bg-white/[0.03] lg:pl-3"
              >
                <div className="hidden text-right lg:block">
                  <div className="text-[13px] font-semibold text-foreground">{user.name}</div>
                  <div className="mt-0.5 flex items-center justify-end gap-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {user.role === "SUPERADMIN" || user.role === "MODERATOR" ? <Shield className="h-3 w-3 text-primary" /> : <Gamepad2 className="h-3 w-3 text-primary" />}
                    <span>{roleLabel}</span>
                  </div>
                </div>
                <div className="rounded-full bg-[image:var(--gradient-primary)] p-[2px] ">
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-background font-display text-base font-bold text-primary">
                    {user.image ? (
                      <img src={user.image} alt="User" className="h-full w-full object-cover" />
                    ) : (
                      user.name?.charAt(0) || "P"
                    )}
                  </div>
                </div>
              </button>

              {profileOpen ? (
                <div className="dropdown-panel absolute right-0 top-full z-50 mt-3 w-[min(19rem,calc(100vw-1rem))] rounded-xl border border-border p-2 shadow-[0_26px_80px_-40px_rgba(0,0,0,0.98)] backdrop-blur-2xl sm:w-[19rem] sm:rounded-xl">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-[image:var(--gradient-primary)] p-[2px]">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-background text-lg font-black text-primary">
                          {user.image ? (
                            <img src={user.image} alt="User" className="h-full w-full object-cover" />
                          ) : (
                            user.name?.charAt(0) || "P"
                          )}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-display text-lg font-black uppercase tracking-[0.08em] text-foreground">{user.name}</div>
                        <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    <Link href="/profile" onClick={() => setProfileOpen(false)} className="action-button-primary mt-4 w-full justify-center text-[11px]">
                      View Player Profile
                    </Link>
                  </div>

                  <div className="mt-2 space-y-1">
                    {/* Theme Toggle in Dropdown for all devices (including mobile) */}
                    <button
                      onClick={toggleTheme}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-primary cursor-pointer text-left"
                    >
                      {theme === "dark" ? (
                        <>
                          <Sun className="h-4 w-4 text-primary" />
                          <span>Light Theme</span>
                        </>
                      ) : (
                        <>
                          <Moon className="h-4 w-4 text-primary" />
                          <span>Dark Theme</span>
                        </>
                      )}
                    </button>

                    {(user.role === "SUPERADMIN" || user.role === "MODERATOR") && (
                      <Link href="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-primary">
                        <Shield className="h-4 w-4 text-primary" />
                        Admin Terminal
                      </Link>
                    )}
                    <Link href="/tournaments" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-primary">
                      <Trophy className="h-4 w-4 text-primary" />
                      Tournament Board
                    </Link>
                    <Link href="/chat" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-primary">
                      <Users className="h-4 w-4 text-primary" />
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
          ) : (
            <Link href="/login" className="action-button-primary text-[11px]">
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Global Modal: Player Profile Card */}
      {selectedUserCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm rounded-2xl shadow-[0_0_40px_-5px_rgba(242,193,78,0.3)] border border-primary/20 relative animate-in zoom-in-95 duration-200">
            {socialLoading && (
              <div className="absolute inset-0 bg-black/60 rounded-2xl z-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            <UserProfileCard
              user={{
                id: selectedUserCard.id,
                name: selectedUserCard.name,
                image: selectedUserCard.image,
                mlbbId: selectedUserCard.mlbbId,
                server: selectedUserCard.server || null,
                wins: selectedUserCard.wins || 0,
                losses: selectedUserCard.losses || 0
              }}
              currentUserId={user?.id}
              friendshipStatus={userModalStatus}
              onAddFriend={handleAddFriendAction}
              onAcceptRequest={handleAcceptFriendAction}
              onSendMessage={handleSendMessageAction}
              onClose={() => setSelectedUserCard(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
