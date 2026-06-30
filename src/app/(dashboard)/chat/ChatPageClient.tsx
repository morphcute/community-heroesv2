"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Send, Hash, Users, MessageSquare, Loader2, AlertCircle, LogIn, Shield, 
  Swords, Axe, Flame, Target, Trophy, Menu, X, Plus, UserPlus, UserCheck, 
  UserMinus, MessageCircle, Search, Check, Clock, UserCheck as FriendIcon,
  type LucideIcon 
} from "lucide-react";
import Link from "next/link";
import { PageHero, PageShell } from "@/components/ui/PageShell";
import UserProfileCard from "@/components/UserProfileCard";
import { 
  sendFriendRequest, 
  acceptFriendRequest, 
  declineFriendRequest, 
  createGroupChat, 
  getOrCreateDM 
} from "./actions";

type MessageUser = {
  id: string;
  name: string | null;
  image: string | null;
  rank: string | null;
  mlbbId: string | null;
  roles?: string[];
};

type RoleBadgeConfig = { label: string; color: string; icon: LucideIcon };

const ROLE_BADGES: Record<string, RoleBadgeConfig> = {
  "TANK_SUPPORT": { label: "Roamer", color: "text-green-400 bg-green-400/10 border-green-400/30 shadow-[0_0_10px_rgba(74,222,128,0.15)]", icon: Shield },
  "FIGHTER": { label: "EXP Laner", color: "text-orange-400 bg-orange-400/10 border-orange-400/30 shadow-[0_0_10px_rgba(251,146,60,0.15)]", icon: Swords },
  "JUNGLER": { label: "Jungler", color: "text-purple-400 bg-purple-400/10 border-purple-400/30 shadow-[0_0_10px_rgba(192,132,252,0.15)]", icon: Axe },
  "MAGE": { label: "Mid Laner", color: "text-slate-400 bg-slate-400/10 border-slate-400/30 shadow-[0_0_10px_rgba(148,163,184,0.15)]", icon: Flame },
  "MARKSMAN": { label: "Gold Laner", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30 shadow-[0_0_10px_rgba(250,204,21,0.15)]", icon: Target },
};

// External rank icon CDN removed to avoid broken images and external dependency.
// Rank is shown as text where needed; this returns null so icon img elements never render.
const getRankIconUrl = (_rank: string) => null;

type ChatMessage = {
  id: string;
  content: string;
  channel: string | null;
  chatRoomId?: string | null;
  createdAt: string;
  user: MessageUser;
};

const CHANNELS = [
  { id: "general",     label: "General",         icon: Hash,           desc: "Open chat for all players" },
  { id: "lfg",        label: "LFG",              icon: Users,          desc: "Looking for group — find your 5th" },
  { id: "role-finder",label: "Role Finder",      icon: MessageSquare,  desc: "Find players for a specific role" },
];

const MLBB_ROLES = ["Roamer", "Gold Laner", "EXP Laner", "Jungler", "Mid Laner"];

interface ChatPageClientProps {
  currentUserId: string | null;
  userTeams: { id: string; name: string }[];
  userTournaments?: { id: string; title: string }[];
}

type SendBody = {
  content: string;
  teamId?: string;
  tournamentId?: string;
  channel?: string;
  chatRoomId?: string;
};

export default function ChatPageClient({ currentUserId, userTeams, userTournaments = [] }: ChatPageClientProps) {
  const [activeChannel, setActiveChannel] = useState("general");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Social/DM state
  const [friendsData, setFriendsData] = useState<{ friends: any[]; pendingReceived: any[]; pendingSent: any[] }>({
    friends: [],
    pendingReceived: [],
    pendingSent: []
  });
  const [rooms, setRooms] = useState<any[]>([]);
  const [isFriendsTabOpen, setIsFriendsTabOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedGroupFriends, setSelectedGroupFriends] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUserModal, setSelectedUserModal] = useState<any>(null);
  const [userModalStatus, setUserModalStatus] = useState<"FRIENDS" | "PENDING_SENT" | "PENDING_RECEIVED" | "NONE" | "SELF">("NONE");
  const [socialLoading, setSocialLoading] = useState(false);
  const [actionPendingId, setActionPendingId] = useState<string | null>(null);
  const [isSearchingServer, setIsSearchingServer] = useState(false);

  const allKnownUsersRef = useRef<Map<string, any>>(new Map());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handlePlayerSearch = useCallback((val: string) => {
    setSearchQuery(val);

    const normalizedVal = val.toLowerCase().trim();
    if (!normalizedVal) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      setIsSearchingServer(false);
      fetch(`/api/social/search?q=`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setSearchResults(data))
        .catch(() => {});
      return;
    }

    // Filter locally known users immediately for 0ms visual feedback
    const localMatches: any[] = [];
    allKnownUsersRef.current.forEach(u => {
      if (
        u.id !== currentUserId &&
        ((u.name && u.name.toLowerCase().includes(normalizedVal)) ||
         (u.email && u.email.toLowerCase().includes(normalizedVal)) ||
         (u.mlbbId && u.mlbbId.toLowerCase().includes(normalizedVal)))
      ) {
        localMatches.push(u);
      }
    });

    setSearchResults(localMatches);

    // Debounced server search to retrieve players from wider DB
    setIsSearchingServer(true);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/social/search?q=${encodeURIComponent(normalizedVal)}`);
        if (res.ok) {
          const serverData = await res.json();
          setSearchResults(prev => {
            const map = new Map();
            localMatches.forEach(item => map.set(item.id, item));
            serverData.forEach((item: any) => map.set(item.id, item));
            return Array.from(map.values());
          });
        }
      } catch {} finally {
        setIsSearchingServer(false);
      }
    }, 150);
  }, [currentUserId]);

  const fetchSocial = useCallback(async () => {
    if (!currentUserId) return null;
    try {
      const res = await fetch("/api/social/friends", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setFriendsData(data);
        return data;
      }
    } catch {}
    return null;
  }, [currentUserId]);

  const fetchRooms = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch("/api/chat/rooms", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch {}
  }, [currentUserId]);

  const fetchMessages = useCallback(async () => {
    try {
      let queryUrl = `/api/chat/messages?channel=${activeChannel}`;
      if (activeChannel.startsWith("team_")) {
        const tId = activeChannel.replace("team_", "");
        queryUrl = `/api/chat/messages?teamId=${tId}`;
      } else if (activeChannel.startsWith("tourney_")) {
        const tId = activeChannel.replace("tourney_", "");
        queryUrl = `/api/chat/messages?tournamentId=${tId}`;
      } else if (activeChannel.startsWith("room_")) {
        const rId = activeChannel.replace("room_", "");
        queryUrl = `/api/chat/messages?chatRoomId=${rId}`;
      }

      const res = await fetch(queryUrl, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data: ChatMessage[] = await res.json();
      setMessages(data);
      setError(null);
    } catch {
      setError("Could not load messages. Retrying...");
    } finally {
      setLoading(false);
    }
  }, [activeChannel]);

  // Poll every 3 seconds for messages and social/DM notifications
  useEffect(() => {
    setLoading(true);
    setMessages([]);
    fetchMessages();
    if (currentUserId) {
      fetchSocial();
      fetchRooms();
    }
    pollRef.current = setInterval(() => {
      fetchMessages();
      if (currentUserId) {
        fetchSocial();
        fetchRooms();
      }
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchMessages, fetchSocial, fetchRooms, currentUserId]);

  useEffect(() => {
    if (isFriendsTabOpen && !searchQuery.trim()) {
      handlePlayerSearch("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFriendsTabOpen, friendsData, handlePlayerSearch]);

  useEffect(() => {
    friendsData.friends.forEach(f => allKnownUsersRef.current.set(f.user.id, f.user));
    friendsData.pendingReceived.forEach(req => allKnownUsersRef.current.set(req.user.id, req.user));
    friendsData.pendingSent.forEach(req => allKnownUsersRef.current.set(req.user.id, req.user));
  }, [friendsData]);

  useEffect(() => {
    searchResults.forEach(p => allKnownUsersRef.current.set(p.id, p));
  }, [searchResults]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check if there is a "?dm=user_id" search param to auto-open direct message
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const dmId = params.get("dm");
      if (dmId && currentUserId) {
        const autoOpenDM = async () => {
          try {
            const roomId = await getOrCreateDM(dmId);
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            await fetchRooms();
            setActiveChannel(`room_${roomId}`);
          } catch {}
        };
        autoOpenDM();
      }
    }
  }, [currentUserId, fetchRooms]);

  const openUserProfileModal = (user: any, freshFriends?: typeof friendsData) => {
    if (!currentUserId) return;
    setSelectedUserModal(user);
    if (user.id === currentUserId) {
      setUserModalStatus("SELF");
      return;
    }
    const data = freshFriends || friendsData;
    // Check relationship
    const isFriend = data.friends.some(f => f.user.id === user.id);
    if (isFriend) {
      setUserModalStatus("FRIENDS");
      return;
    }
    const isSent = data.pendingSent.some(f => f.user.id === user.id);
    if (isSent) {
      setUserModalStatus("PENDING_SENT");
      return;
    }
    const isReceived = data.pendingReceived.some(f => f.user.id === user.id);
    if (isReceived) {
      setUserModalStatus("PENDING_RECEIVED");
      return;
    }
    setUserModalStatus("NONE");
  };

  const handleAddFriendAction = async () => {
    if (!selectedUserModal) return;
    setSocialLoading(true);
    const res = await sendFriendRequest(selectedUserModal.id);
    if (res.ok) {
      const fresh = await fetchSocial();
      openUserProfileModal(selectedUserModal, fresh || undefined);
    }
    setSocialLoading(false);
  };

  const handleAcceptFriendAction = async () => {
    if (!selectedUserModal) return;
    const request = friendsData.pendingReceived.find(f => f.user.id === selectedUserModal.id);
    if (!request) return;
    setSocialLoading(true);
    const res = await acceptFriendRequest(request.friendshipId);
    if (res.ok) {
      const fresh = await fetchSocial();
      await fetchRooms();
      openUserProfileModal(selectedUserModal, fresh || undefined);
    }
    setSocialLoading(false);
  };

  const handleSendMessageAction = async () => {
    if (!selectedUserModal) return;
    setSocialLoading(true);
    try {
      const roomId = await getOrCreateDM(selectedUserModal.id);
      setSelectedUserModal(null); // Close modal
      setIsFriendsTabOpen(false); // Switch away from friends dashboard
      await fetchRooms();
      setActiveChannel(`room_${roomId}`); // Switch to DM room chat
    } catch {}
    setSocialLoading(false);
  };


  const toggleGroupFriend = (friendId: string) => {
    setSelectedGroupFriends(prev => 
      prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedGroupFriends.length === 0) return;
    const res = await createGroupChat(groupName, selectedGroupFriends);
    if (res.ok && (res as any).chatRoomId) {
      setGroupName("");
      setSelectedGroupFriends([]);
      setIsGroupModalOpen(false);
      await fetchRooms();
      setActiveChannel(`room_${(res as any).chatRoomId}`);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || sending || !currentUserId) return;
    const content = input.trim();
    setInput("");
    setSending(true);
    try {
      const body: SendBody = { content };
      if (activeChannel.startsWith("team_")) {
        body.teamId = activeChannel.replace("team_", "");
      } else if (activeChannel.startsWith("tourney_")) {
        body.tournamentId = activeChannel.replace("tourney_", "");
      } else if (activeChannel.startsWith("room_")) {
        body.chatRoomId = activeChannel.replace("room_", "");
      } else {
        body.channel = activeChannel;
      }

      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Send failed");
      await fetchMessages();
    } catch {
      setError("Failed to send message.");
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMessageContent = (content: string) => {
    const teamRegex = /\[TEAM:(.*?):(.*?)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = teamRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      const teamName = match[1];
      const teamId = match[2];
      
      parts.push(
        <Link 
          key={match.index + teamId} 
          href={`/teams/${teamId}`}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/25 rounded-md font-bold mx-1 transition-all hover:scale-105 active:scale-95 align-sub shadow-[0_0_15px_-3px_rgba(250,204,21,0.2)]"
        >
          <Users className="w-3 h-3 flex-shrink-0" />
          Join {teamName}
        </Link>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  const handleChannelSelect = (channelId: string) => {
    setIsFriendsTabOpen(false);
    setActiveChannel(channelId);
    setIsMobileSidebarOpen(false);
  };

  const getRoomName = (room: any) => {
    if (room.isGroup) return room.name || "Group Chat";
    const peer = room.participants.find((p: any) => p.user.id !== currentUserId);
    return peer?.user.name || "Direct Message";
  };

  const activeChannelInfo = activeChannel.startsWith("team_")
    ? {
        label: userTeams.find(t => t.id === activeChannel.replace("team_", ""))?.name || "Team Chat",
        desc: "Private channel for your team",
        icon: Users
      }
    : activeChannel.startsWith("tourney_")
      ? {
          label: userTournaments.find(t => t.id === activeChannel.replace("tourney_", ""))?.title || "Tournament Chat",
          desc: "Exclusive chat for tournament participants",
          icon: Trophy
        }
      : activeChannel.startsWith("room_")
        ? {
            label: getRoomName(rooms.find(r => r.id === activeChannel.replace("room_", ""))),
            desc: rooms.find(r => r.id === activeChannel.replace("room_", ""))?.isGroup ? "Private group chat" : "Direct Message",
            icon: MessageCircle
          }
        : CHANNELS.find(c => c.id === activeChannel);

  return (
    <PageShell size="wide" tone="gold">
      <PageHero
        eyebrow="Community Comms"
        icon={<MessageSquare className="h-4 w-4" />}
        title={
          <>
            Connect in the
            <span className="text-gradient-primary"> arena lobby</span>
          </>
        }
        description="Connect with teams, form alliances, message friends, and construct group chats in the Community Heroes platform."
        stats={[
          { label: "Channels", value: CHANNELS.length },
          { label: "Friends", value: friendsData.friends.length },
          { label: "Group DMs", value: rooms.length },
        ]}
      />

      <div className="relative flex h-[calc(100vh-21rem)] min-h-[580px] gap-4 overflow-hidden lg:gap-5">
        {/* Mobile Overlay Background */}
        {isMobileSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Channel Sidebar */}
        <aside className={`
          absolute md:relative z-50 h-full w-64 border border-border bg-card flex flex-col shadow-2xl md:shadow-none rounded-[1.6rem] md:rounded-[1.8rem]
          transform transition-transform duration-300 ease-in-out
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}>
          {/* Mobile Header */}
          <div className="md:hidden p-4 flex items-center justify-between border-b border-border">
            <span className="text-[12px] font-bold text-foreground uppercase tracking-widest">Navigation</span>
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Friends Tab Trigger */}
          {currentUserId && (
            <div className="p-3 border-b border-border">
              <button
                onClick={() => {
                  setIsFriendsTabOpen(true);
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                  isFriendsTabOpen
                    ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(250,204,21,0.3)]"
                    : "bg-muted border-border text-foreground hover:border-primary/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FriendIcon className="w-4 h-4" />
                  <span>Friends Manager</span>
                </div>
                {friendsData.pendingReceived.length > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-bounce">
                    {friendsData.pendingReceived.length}
                  </span>
                )}
              </button>
            </div>
          )}

          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {/* MLBB Public Channels */}
            <div className="p-4 py-2">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Arena Channels</div>
            </div>
            <div className="px-2 pb-3 space-y-0.5">
              {CHANNELS.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => handleChannelSelect(ch.id)}
                  className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                    !isFriendsTabOpen && activeChannel === ch.id
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <span className={`w-3.5 h-3.5 flex items-center justify-center font-black ${!isFriendsTabOpen && activeChannel === ch.id ? "text-primary" : "text-muted-foreground/60"}`}>
                    #
                  </span>
                  {ch.label}
                </button>
              ))}
            </div>

            {/* Direct & Group Messages */}
            {currentUserId && (
              <>
                <div className="p-4 py-2 border-t border-border flex items-center justify-between">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Private Rooms</div>
                  <button 
                    onClick={() => setIsGroupModalOpen(true)}
                    className="p-1 rounded hover:bg-muted text-primary transition-colors cursor-pointer"
                    title="Create Group Chat"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="px-2 pb-3 space-y-0.5 max-h-[160px] overflow-y-auto custom-scrollbar">
                  {rooms.length === 0 ? (
                    <div className="text-[10px] text-muted-foreground/60 px-3 py-2 italic">No active conversations</div>
                  ) : (
                    rooms.map(room => (
                      <button
                        key={room.id}
                        onClick={() => handleChannelSelect(`room_${room.id}`)}
                        className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                          !isFriendsTabOpen && activeChannel === `room_${room.id}`
                            ? "bg-primary/10 text-primary border-l-2 border-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                          {room.isGroup ? <Users className="w-3.5 h-3.5" /> : <MessageCircle className="w-3.5 h-3.5" />}
                        </span>
                        <span className="text-[13px] font-semibold truncate flex-1">
                          {getRoomName(room)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}

            {/* Tournaments */}
            {userTournaments.length > 0 && (
              <>
                <div className="p-4 py-2 border-t border-border">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Events</div>
                </div>
                <div className="px-2 pb-3 space-y-0.5 max-h-[160px] overflow-y-auto custom-scrollbar">
                  {userTournaments.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleChannelSelect(`tourney_${t.id}`)}
                      className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                        !isFriendsTabOpen && activeChannel === `tourney_${t.id}`
                          ? "bg-primary/10 text-primary border-l-2 border-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-[13px] font-semibold truncate flex-1">
                        {t.title}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Teams */}
            {userTeams.length > 0 && (
              <>
                <div className="p-4 py-2 border-t border-border">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">My Teams</div>
                </div>
                <div className="px-2 pb-3 space-y-0.5 max-h-[160px] overflow-y-auto custom-scrollbar">
                  {userTeams.map(team => (
                    <button
                      key={team.id}
                      onClick={() => handleChannelSelect(`team_${team.id}`)}
                      className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                        !isFriendsTabOpen && activeChannel === `team_${team.id}`
                          ? "bg-primary/10 text-primary border-l-2 border-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                    >
                      <Users className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-[13px] font-semibold truncate flex-1">
                        {team.name}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Bottom Branding info */}
          <div className="p-3 border-t border-border bg-muted/40">
            <div className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest mb-1.5">MLBB Comms</div>
            <div className="flex flex-wrap gap-1">
              {MLBB_ROLES.map(role => (
                <span key={role} className="text-[9px] px-2 py-0.5 bg-muted text-muted-foreground rounded-md border border-border font-semibold">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Interface Box */}
        <main className="flex-1 flex min-w-0 flex-col overflow-hidden rounded-[1.8rem] border border-border bg-card">
          {isFriendsTabOpen ? (
            /* Friends Manager Dashboard */
            <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200 flex items-center gap-3">
                    <FriendIcon className="w-6 h-6 text-primary" />
                    Friends Manager
                  </h2>
                  <p className="text-muted-foreground text-xs mt-1">Search competitors, manage incoming player requests, and launch private rooms.</p>
                </div>
                <button
                  onClick={() => setIsFriendsTabOpen(false)}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-border"
                >
                  Back to chat
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
                {/* Left side: Search & Requests */}
                <div className="flex flex-col gap-5 overflow-y-auto pr-1 custom-scrollbar">
                  {/* Search Competitors */}
                  <div className="hud-panel p-4 space-y-3 bg-muted border border-primary/20 rounded-2xl shadow-[0_0_20px_rgba(250,204,21,0.02)] transition-all hover:border-primary/35">
                    <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-primary" />
                      Add Competitors
                    </h3>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handlePlayerSearch(e.target.value)}
                        placeholder="Search by name, email, or MLBB ID..."
                        className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground focus:border-primary/50 focus:shadow-[0_0_15px_rgba(250,204,21,0.1)] outline-none transition-all placeholder:text-muted-foreground/60"
                      />
                      {isSearchingServer ? (
                        <Loader2 className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-primary animate-spin" />
                      ) : (
                        <Search className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Results / Suggestions Header */}
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-2 flex items-center gap-2 border-t border-border">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                      {searchQuery.trim() ? "Search Results" : "Suggested Players"}
                    </div>

                    {/* Search Results / Suggestions List */}
                    {searchResults.length > 0 ? (
                      <div className="space-y-1.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                        {searchResults.map(p => (
                          <div 
                            key={p.id} 
                            className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border hover:border-primary/25 hover:bg-muted transition-all duration-300 hover:-translate-y-0.5"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <button 
                                onClick={() => openUserProfileModal(p)}
                                className="w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center text-xs text-muted-foreground font-bold border border-border hover:border-primary/50 transition-colors cursor-pointer"
                              >
                                {p.image ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : p.name?.charAt(0)}
                              </button>
                              <div className="min-w-0">
                                <span 
                                  onClick={() => openUserProfileModal(p)}
                                  className="font-bold text-foreground text-xs block truncate hover:text-primary transition-colors cursor-pointer"
                                >
                                  {p.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground block truncate">
                                  {p.mlbbId ? `ID: ${p.mlbbId}` : "Community Hero"}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => openUserProfileModal(p)}
                              className="px-3.5 py-1.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-black rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(250,204,21,0.05)] hover:shadow-[0_0_15px_rgba(250,204,21,0.25)]"
                            >
                              Profile
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground text-xs italic">
                        {searchQuery.trim() ? "No players found matching your query." : "No suggestions available."}
                      </div>
                    )}
                  </div>

                  {/* Pending Requests */}
                  <div className="hud-panel p-4 space-y-3 flex-1 flex flex-col min-h-[200px] bg-muted border border-primary/20 rounded-2xl shadow-[0_0_20px_rgba(250,204,21,0.02)] transition-all hover:border-primary/35">
                    <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        Incoming Requests
                      </span>
                      {friendsData.pendingReceived.length > 0 && (
                        <span className="text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full animate-pulse">
                          {friendsData.pendingReceived.length} Pending
                        </span>
                      )}
                    </h3>

                    <div className="space-y-2 overflow-y-auto flex-1 custom-scrollbar pr-1">
                      {friendsData.pendingReceived.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-muted-foreground text-xs italic">
                          No incoming friend invitations
                        </div>
                      ) : (
                        friendsData.pendingReceived.map(req => (
                          <div 
                            key={req.friendshipId} 
                            className="flex items-center justify-between p-3 rounded-xl bg-background border border-border hover:border-primary/10 transition-all duration-300"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button 
                                onClick={() => openUserProfileModal(req.user)}
                                className="w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center text-xs text-muted-foreground font-bold border border-border hover:border-primary/50 transition-colors cursor-pointer"
                              >
                                {req.user.image ? <img src={req.user.image} className="w-full h-full object-cover" alt="" /> : req.user.name?.charAt(0)}
                              </button>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span 
                                    onClick={() => openUserProfileModal(req.user)}
                                    className="font-bold text-foreground text-xs hover:text-primary transition-colors cursor-pointer block truncate"
                                  >
                                    {req.user.name}
                                  </span>
                                  {req.user.rank && (
                                    <div title={req.user.rank} className="flex items-center justify-center p-[2px] bg-muted rounded-md border border-border scale-75 flex-shrink-0">
                                      {getRankIconUrl(req.user.rank) ? (
                                        <img src={getRankIconUrl(req.user.rank)!} alt={req.user.rank} className="w-3.5 h-3.5 object-contain" />
                                      ) : (
                                        <Trophy className="w-3.5 h-3.5 text-muted-foreground" />
                                      )}
                                    </div>
                                  )}
                                </div>
                                <span className="text-[9px] text-muted-foreground font-semibold block uppercase tracking-wider truncate">
                                  {req.user.rank || "Rookie"}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={async () => {
                                  setActionPendingId(req.friendshipId);
                                  const res = await acceptFriendRequest(req.friendshipId);
                                  if (res.ok) {
                                    await fetchSocial();
                                    await fetchRooms();
                                  }
                                  setActionPendingId(null);
                                }}
                                disabled={actionPendingId !== null}
                                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                              >
                                {actionPendingId === req.friendshipId ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : null}
                                Accept
                              </button>
                              <button
                                onClick={async () => {
                                  setActionPendingId(req.friendshipId);
                                  const res = await declineFriendRequest(req.friendshipId);
                                  if (res.ok) {
                                    await fetchSocial();
                                  }
                                  setActionPendingId(null);
                                }}
                                disabled={actionPendingId !== null}
                                className="px-3.5 py-1.5 bg-muted border border-border hover:bg-muted/80 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Friends list */}
                <div className="hud-panel p-4 flex flex-col h-full overflow-hidden bg-muted border border-primary/20 rounded-2xl shadow-[0_0_20px_rgba(250,204,21,0.02)] transition-all hover:border-primary/35">
                  <h3 className="text-xs font-black text-foreground uppercase tracking-wider mb-4 border-b border-border pb-2.5 flex items-center gap-2">
                    <FriendIcon className="w-4 h-4 text-primary" />
                    My Friends ({friendsData.friends.length})
                  </h3>
                  <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                    {friendsData.friends.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground text-xs italic py-12">
                        Add friends to start direct messaging or building squad lobbies.
                      </div>
                    ) : (
                      friendsData.friends.map(f => (
                        <div 
                          key={f.friendshipId} 
                          className="friend-row flex items-center justify-between p-3 rounded-xl bg-background border border-border hover:border-primary/25 hover:bg-muted transition-all duration-300 hover:-translate-y-0.5"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <button 
                              onClick={() => openUserProfileModal(f.user)}
                              className="w-9 h-9 rounded-full overflow-hidden bg-muted flex items-center justify-center text-xs text-muted-foreground font-bold border border-border hover:border-primary/50 transition-colors cursor-pointer flex-shrink-0"
                            >
                              {f.user.image ? <img src={f.user.image} className="w-full h-full object-cover" alt="" /> : f.user.name?.charAt(0)}
                            </button>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <button 
                                  onClick={() => openUserProfileModal(f.user)}
                                  className="font-bold text-foreground text-xs hover:text-primary transition-colors text-left block truncate"
                                >
                                  {f.user.name}
                                </button>
                                {f.user.rank && (
                                  <div title={f.user.rank} className="flex items-center justify-center p-[2px] bg-muted rounded-md border border-border scale-75 flex-shrink-0">
                                    {getRankIconUrl(f.user.rank) ? (
                                      <img src={getRankIconUrl(f.user.rank)!} alt={f.user.rank} className="w-3.5 h-3.5 object-contain" />
                                    ) : (
                                      <Trophy className="w-3.5 h-3.5 text-muted-foreground" />
                                    )}
                                  </div>
                                )}
                              </div>
                              <span className="text-[10px] text-muted-foreground block truncate">
                                {f.user.mlbbId ? `ID: ${f.user.mlbbId}` : "Community Hero"}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              const roomId = await getOrCreateDM(f.user.id);
                              setIsFriendsTabOpen(false);
                              await fetchRooms();
                              setActiveChannel(`room_${roomId}`);
                            }}
                            className="p-2.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-black rounded-lg transition-all active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(250,204,21,0.05)] hover:shadow-[0_0_15px_rgba(250,204,21,0.25)] flex-shrink-0"
                            title="Direct Message"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Active Chat Lobby Component */
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-border px-4 md:px-6 py-4 flex items-center gap-4">
                <button 
                  className="md:hidden p-1.5 rounded-lg bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors" 
                  onClick={() => setIsMobileSidebarOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </button>
                
                <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center flex-shrink-0">
                  {activeChannelInfo?.icon && <activeChannelInfo.icon className="w-5 h-5 text-primary" />}
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-[15px] font-bold text-foreground tracking-wide truncate">
                    {activeChannelInfo?.label || "Unknown Channel"}
                  </h2>
                  <p className="text-[11px] text-muted-foreground font-medium truncate">
                    {activeChannelInfo?.desc}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                  <span className="text-[11px] text-primary font-bold">Live</span>
                </div>
              </div>

              {/* Messages Grid */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-[12px]">Retrieving messages...</span>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-[13px] font-bold text-muted-foreground">No messages yet</p>
                      <p className="text-[11px] text-muted-foreground/60 mt-1">Ready your squad and say something!</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => {
                      const isMe = msg.user.id === currentUserId;
                      const prevMsg = messages[i - 1];
                      const showHeader = !prevMsg || prevMsg.user.id !== msg.user.id || 
                        new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 5 * 60 * 1000;

                      return (
                        <div key={msg.id} className={`flex gap-2.5 group ${showHeader ? "mt-4 first:mt-0" : "mt-0.5"}`}>
                          {/* Avatar */}
                          <div className="w-8 flex-shrink-0 pt-0.5">
                            {showHeader && (
                              <button 
                                onClick={() => openUserProfileModal(msg.user)}
                                className="w-8 h-8 rounded-full bg-background border border-border overflow-hidden flex items-center justify-center text-[11px] font-bold text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer"
                              >
                                {msg.user.image ? (
                                  <img src={msg.user.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  msg.user.name?.charAt(0) || "?"
                                )}
                              </button>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {showHeader && (
                              <div className="mb-1 flex flex-col gap-0.5">
                                {/* Roles */}
                                {msg.user.roles && msg.user.roles.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-0.5">
                                    {msg.user.roles.map(r => {
                                      const badge = ROLE_BADGES[r];
                                      if (!badge) return null;
                                      const Icon = badge.icon;
                                      return (
                                        <div 
                                          key={r} 
                                          title={badge.label}
                                          className={`p-0.5 rounded-[4px] flex items-center justify-center border ${badge.color} opacity-90`}
                                        >
                                          <Icon className="w-[10px] h-[10px]" strokeWidth={2.5} />
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => openUserProfileModal(msg.user)}
                                    className={`text-[13px] font-bold leading-none hover:text-primary transition-colors text-left ${isMe ? "text-primary font-black" : "text-foreground"}`}
                                  >
                                    {msg.user.name || "Anonymous"}
                                  </button>
                                  {msg.user.mlbbId && (
                                    <span className="text-[10px] text-muted-foreground/70 font-medium tracking-wide">
                                      [{msg.user.mlbbId}]
                                    </span>
                                  )}
                                  {msg.user.rank && (
                                    <div title={msg.user.rank} className="flex items-center justify-center p-[3px] bg-muted rounded-md border border-border">
                                      {getRankIconUrl(msg.user.rank) ? (
                                        <img src={getRankIconUrl(msg.user.rank)!} alt={msg.user.rank} className="w-4 h-4 object-contain" />
                                      ) : (
                                        <Trophy className="w-3.5 h-3.5 text-muted-foreground" />
                                      )}
                                    </div>
                                  )}
                                  <span className="text-[10px] text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                                    {new Date(msg.createdAt).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                              </div>
                            )}
                            <div className="text-[13px] leading-relaxed text-foreground/90 break-words pr-4">
                              {renderMessageContent(msg.content)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </>
                )}
              </div>

              {/* Error Alert */}
              {error && (
                <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <span className="text-[11px] text-red-400">{error}</span>
                </div>
              )}

              {/* Message Input Container */}
              <div className="p-3 border-t border-border bg-muted/30 flex-shrink-0">
                {currentUserId ? (
                  <div className="flex flex-col gap-2">
                    {userTeams && userTeams.length > 0 && !activeChannel.startsWith("room_") && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Share Team:</span>
                        {userTeams.map(team => (
                          <button
                            key={team.id}
                            onClick={() => {
                              setInput(prev => {
                                const val = prev.trim();
                                return val ? `${val} [TEAM:${team.name}:${team.id}] ` : `[TEAM:${team.name}:${team.id}] `;
                              });
                            }}
                            className="px-2.5 py-1 bg-primary/5 hover:bg-primary/15 text-primary/85 hover:text-primary border border-primary/20 rounded-lg text-[9px] font-black transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Users className="w-3 h-3" />
                            {team.name}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex items-end gap-2 bg-background border border-border focus-within:border-primary/45 rounded-xl transition-all p-2">
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Message #${activeChannelInfo?.label || "channel"}... (Enter to send)`}
                        className="flex-1 bg-transparent resize-none text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none max-h-28 min-h-[36px] leading-relaxed py-1 px-2"
                        rows={1}
                        maxLength={1000}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!input.trim() || sending}
                        className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                          input.trim() && !sending
                            ? "bg-primary text-black hover:bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)] active:scale-95 cursor-pointer"
                            : "bg-muted text-muted-foreground/60 cursor-not-allowed"
                        }`}
                      >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3 py-3 bg-muted/40 border border-border rounded-xl">
                    <LogIn className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[12px] text-muted-foreground">
                      <Link href="/login" className="text-primary hover:underline font-bold">Sign in</Link> to send messages
                    </span>
                  </div>
                )}
                <div className="flex justify-between mt-1.5 px-1">
                  <span className="text-[9px] text-muted-foreground/60">Community chat · Be respectful · Keep it clean</span>
                  <span className="text-[9px] text-muted-foreground/60">Enter to send, Shift+Enter for new line</span>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modal: Interactive Profiler Card */}
      {selectedUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm rounded-2xl shadow-[0_0_40px_-5px_rgba(250,204,21,0.3)] border border-primary/20 relative animate-in zoom-in-95 duration-200">
            {socialLoading && (
              <div className="absolute inset-0 bg-black/60 rounded-2xl z-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            <UserProfileCard
              user={selectedUserModal}
              currentUserId={currentUserId}
              friendshipStatus={userModalStatus}
              onAddFriend={handleAddFriendAction}
              onAcceptRequest={handleAcceptFriendAction}
              onSendMessage={handleSendMessageAction}
              onClose={() => setSelectedUserModal(null)}
            />
          </div>
        </div>
      )}

      {/* Modal: Create Group Chat */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => {
                setIsGroupModalOpen(false);
                setGroupName("");
                setSelectedGroupFriends([]);
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-foreground uppercase tracking-wider mb-5 border-b border-border pb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Create Group Chat
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Squad Elite Practice"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-primary/50 outline-none"
                />
              </div>

              <div className="space-y-1.5 flex flex-col flex-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select Friends</label>
                <div className="border border-border rounded-xl bg-background p-2 max-h-[200px] overflow-y-auto custom-scrollbar space-y-1">
                  {friendsData.friends.length === 0 ? (
                    <div className="text-[11px] text-muted-foreground italic p-4 text-center">Add friends before building group chats.</div>
                  ) : (
                    friendsData.friends.map(f => (
                      <label 
                        key={f.user.id} 
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border hover:border-primary/10 transition-colors ${
                          selectedGroupFriends.includes(f.user.id) ? "bg-primary/5 border-primary/20" : "bg-transparent border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-muted flex items-center justify-center text-xs text-muted-foreground font-bold border border-border">
                            {f.user.image ? <img src={f.user.image} className="w-full h-full object-cover" /> : f.user.name?.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-foreground">{f.user.name}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedGroupFriends.includes(f.user.id)}
                          onChange={() => toggleGroupFriend(f.user.id)}
                          className="accent-primary w-3.5 h-3.5 cursor-pointer"
                        />
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  onClick={() => {
                    setIsGroupModalOpen(false);
                    setGroupName("");
                    setSelectedGroupFriends([]);
                  }}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 border border-border text-foreground rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || selectedGroupFriends.length === 0}
                  className="px-6 py-2 bg-primary text-black hover:bg-yellow-400 disabled:bg-muted disabled:text-muted-foreground/50 disabled:border-transparent rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 disabled:scale-100 cursor-pointer disabled:cursor-not-allowed"
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
