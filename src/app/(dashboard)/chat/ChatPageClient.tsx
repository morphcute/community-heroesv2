"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Hash, Users, MessageSquare, Loader2, AlertCircle, LogIn, Shield, Swords, Axe, Flame, Target, Trophy, Menu, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { PageHero, PageShell } from "@/components/ui/PageShell";

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
  "MAGE": { label: "Mid Laner", color: "text-blue-400 bg-blue-400/10 border-blue-400/30 shadow-[0_0_10px_rgba(96,165,250,0.15)]", icon: Flame },
  "MARKSMAN": { label: "Gold Laner", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30 shadow-[0_0_10px_rgba(250,204,21,0.15)]", icon: Target },
};

const getRankIconUrl = (rank: string) => {
  const r = rank.toLowerCase();
  if (r.includes("immortal")) return "https://static.wikia.nocookie.net/mobile-legends/images/3/3c/Mythical_Immortal.png/revision/latest";
  if (r.includes("glory")) return "https://static.wikia.nocookie.net/mobile-legends/images/4/42/Mythical_Glory.png/revision/latest";
  if (r.includes("honor")) return "https://static.wikia.nocookie.net/mobile-legends/images/c/c8/Mythical_Honor.png/revision/latest";
  if (r.includes("mythic")) return "https://static.wikia.nocookie.net/mobile-legends/images/e/ec/Mythic.png/revision/latest";
  if (r.includes("legend")) return "https://static.wikia.nocookie.net/mobile-legends/images/1/10/Legend.png/revision/latest";
  if (r.includes("epic")) return "https://static.wikia.nocookie.net/mobile-legends/images/2/26/Epic.png/revision/latest";
  if (r.includes("grandmaster")) return "https://static.wikia.nocookie.net/mobile-legends/images/2/28/Grandmaster.png/revision/latest";
  if (r.includes("master")) return "https://static.wikia.nocookie.net/mobile-legends/images/6/6b/Master.png/revision/latest";
  if (r.includes("elite")) return "https://static.wikia.nocookie.net/mobile-legends/images/e/e3/Elite.png/revision/latest";
  if (r.includes("warrior")) return "https://static.wikia.nocookie.net/mobile-legends/images/9/97/Warrior.png/revision/latest";
  return null;
};

type ChatMessage = {
  id: string;
  content: string;
  channel: string | null;
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
};

export default function ChatPageClient({ currentUserId, userTeams, userTournaments = [] }: ChatPageClientProps) {
  const [activeChannel, setActiveChannel] = useState("general");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      let queryUrl = `/api/chat/messages?channel=${activeChannel}`;
      if (activeChannel.startsWith("team_")) {
        const tId = activeChannel.replace("team_", "");
        queryUrl = `/api/chat/messages?teamId=${tId}`;
      } else if (activeChannel.startsWith("tourney_")) {
        const tId = activeChannel.replace("tourney_", "");
        queryUrl = `/api/chat/messages?tournamentId=${tId}`;
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

  // Poll every 3 seconds
  useEffect(() => {
    setLoading(true);
    setMessages([]);
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      } else {
        body.channel = activeChannel;
      }

      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Send failed");
      // Immediately refresh instead of waiting for poll
      await fetchMessages();
    } catch {
      setError("Failed to send message.");
      setInput(content); // restore input
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
          className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/25 rounded-md font-bold mx-1 transition-all hover:scale-105 active:scale-95 align-sub shadow-[0_0_15px_-3px_rgba(255,215,0,0.2)]"
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
    setActiveChannel(channelId);
    setIsMobileSidebarOpen(false);
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
      : CHANNELS.find(c => c.id === activeChannel);

  return (
    <PageShell size="wide" tone="blue">
      <PageHero
        eyebrow="Community Comms"
        icon={<MessageSquare className="h-4 w-4" />}
        title={
          <>
            Connect in the
            <span className="text-gradient-electric"> team chat</span>
          </>
        }
        description="Move between public channels, team chat, and tournament rooms with a cleaner Mobile Legends-style chat layout."
        stats={[
          { label: "Channels", value: CHANNELS.length },
          { label: "Teams", value: userTeams.length },
          { label: "Events", value: userTournaments.length },
        ]}
      />

      <div className="relative flex h-[calc(100vh-21rem)] min-h-[560px] gap-4 overflow-hidden lg:gap-5">
      {/* Mobile Overlay Background */}
      {isMobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Channel Sidebar */}
      <aside className={`
        absolute md:relative z-50 h-full w-64 border border-white/10 bg-[linear-gradient(180deg,rgba(8,11,25,0.98),rgba(10,14,31,0.86))] flex flex-col shadow-2xl md:shadow-none rounded-[1.6rem] md:rounded-[1.8rem]
        transform transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Mobile Header / Close button inside sidebar */}
        <div className="md:hidden p-4 flex items-center justify-between border-b border-white/[0.05]">
          <span className="text-[12px] font-bold text-white uppercase tracking-widest">Navigation</span>
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 border-b border-white/[0.05]">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">MLBB Channels</div>
        </div>
        <div className="overflow-y-auto p-2 space-y-0.5">
          {CHANNELS.map(ch => (
            <button
              key={ch.id}
              onClick={() => handleChannelSelect(ch.id)}
              className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${
                activeChannel === ch.id
                  ? "bg-[#FFD700]/10 text-[#FFD700]"
                  : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]"
              }`}
            >
              <span className={`w-3.5 h-3.5 flex items-center justify-center font-black ${activeChannel === ch.id ? "text-[#FFD700]" : "text-gray-600"}`}>
                #
              </span>
              {ch.label}
            </button>
          ))}
        </div>

        {userTournaments.length > 0 && (
          <>
            <div className="p-4 border-y border-white/[0.05]">
              <div className="text-[11px] font-bold text-[#FFD700] uppercase tracking-widest flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5" />
                My Tournaments
              </div>
            </div>
            <div className="overflow-y-auto p-2 space-y-0.5 max-h-[30%]">
              {userTournaments.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleChannelSelect(`tourney_${t.id}`)}
                  className={`w-full text-left flex flex-col gap-0.5 px-3 py-2.5 rounded-lg transition-all ${
                    activeChannel === `tourney_${t.id}`
                      ? "bg-[#FFD700]/10"
                      : "hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 w-full">
                    <span className={`w-3.5 h-3.5 flex items-center justify-center font-black shrink-0 ${activeChannel === `tourney_${t.id}` ? "text-[#FFD700]" : "text-gray-600"}`}>
                      #
                    </span>
                    <span className={`text-[13px] font-semibold truncate ${activeChannel === `tourney_${t.id}` ? "text-[#FFD700]" : "text-gray-400"}`}>
                      {t.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {userTeams.length > 0 && (
          <>
            <div className="p-4 border-y border-white/[0.05]">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">My Teams</div>
            </div>
            <div className="overflow-y-auto p-2 space-y-0.5 max-h-[30%]">
              {userTeams.map(team => (
                <button
                  key={team.id}
                  onClick={() => handleChannelSelect(`team_${team.id}`)}
                  className={`w-full text-left flex flex-col gap-0.5 px-3 py-2.5 rounded-lg transition-all ${
                    activeChannel === `team_${team.id}`
                      ? "bg-[#FFD700]/10"
                      : "hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 w-full">
                    <span className={`w-3.5 h-3.5 flex items-center justify-center font-black shrink-0 ${activeChannel === `team_${team.id}` ? "text-[#FFD700]" : "text-gray-600"}`}>
                      #
                    </span>
                    <span className={`text-[13px] font-semibold truncate ${activeChannel === `team_${team.id}` ? "text-[#FFD700]" : "text-gray-400"}`}>
                      {team.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* MLBB Roles hint */}
        <div className="p-3 border-t border-white/[0.05]">
          <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-2">MLBB Roles</div>
          <div className="flex flex-wrap gap-1">
            {MLBB_ROLES.map(role => (
              <span key={role} className="text-[9px] px-2 py-0.5 bg-white/[0.04] text-gray-500 rounded-full border border-white/[0.06] font-medium">
                {role}
              </span>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex min-w-0 flex-col overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,11,25,0.98),rgba(10,14,31,0.86))]">

        {/* Chat Header */}
        <div className="h-16 border-b border-white/[0.05] px-4 md:px-6 py-4 flex items-center gap-4">
          <button 
            className="md:hidden p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05] text-gray-400 hover:text-white transition-colors" 
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center flex-shrink-0">
            {activeChannelInfo?.icon && <activeChannelInfo.icon className="w-5 h-5 text-gray-400" />}
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] font-bold text-white tracking-wide truncate">
              {activeChannelInfo?.label || "Unknown Channel"}
            </h2>
            <p className="text-[11px] text-gray-500 font-medium truncate">
              {activeChannelInfo?.desc}
            </p>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[11px] text-gray-600 font-medium">Live</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-gray-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-[12px]">Loading messages...</span>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-[13px] font-bold text-gray-500">No messages yet</p>
                <p className="text-[11px] text-gray-700 mt-1">Be the first to say something!</p>
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
                    {/* Avatar — only show on first message in group */}
                    <div className="w-8 flex-shrink-0 pt-0.5">
                      {showHeader && (
                        <div className="w-8 h-8 rounded-full bg-[#111111] border border-white/[0.07] overflow-hidden flex items-center justify-center text-[11px] font-bold text-gray-400">
                          {msg.user.image ? (
                            <img src={msg.user.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            msg.user.name?.charAt(0) || "?"
                          )}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                      <div className="flex-1 min-w-0">
                        {showHeader && (
                          <div className="mb-1 flex flex-col gap-0.5">
                            {/* ROLES BADGES AT THE TOP */}
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
                              <span className={`text-[13px] font-bold leading-none ${isMe ? "text-[#FFD700]" : "text-white"}`}>
                                {msg.user.name || "Anonymous"}
                              </span>
                              {msg.user.mlbbId && (
                                <span className="text-[10px] text-gray-600 font-medium tracking-wide">
                                  [{msg.user.mlbbId}]
                                </span>
                              )}
                              {msg.user.rank && (
                                <div title={msg.user.rank} className="flex items-center justify-center p-[3px] bg-white/[0.04] rounded-md border border-white/[0.07]">
                                  {getRankIconUrl(msg.user.rank) ? (
                                    <img src={getRankIconUrl(msg.user.rank)!} alt={msg.user.rank} className="w-4 h-4 object-contain" />
                                  ) : (
                                    <Trophy className="w-3.5 h-3.5 text-gray-400" />
                                  )}
                                </div>
                              )}
                              <span className="text-[10px] text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                                {new Date(msg.createdAt).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          </div>
                        )}
                      <div className={`text-[13px] leading-relaxed text-gray-300 break-words ${showHeader ? "" : "pl-0"}`}>
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

        {/* Error Banner */}
        {error && (
          <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            <span className="text-[11px] text-red-400">{error}</span>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 border-t border-white/[0.05] flex-shrink-0">
          {currentUserId ? (
            <div className="flex flex-col gap-2">
              {userTeams && userTeams.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Share Team:</span>
                  {userTeams.map(team => (
                    <button
                      key={team.id}
                      onClick={() => {
                        setInput(prev => {
                          const val = prev.trim();
                          return val ? `${val} [TEAM:${team.name}:${team.id}] ` : `[TEAM:${team.name}:${team.id}] `;
                        });
                      }}
                      className="px-2.5 py-1 bg-[#FFD700]/5 hover:bg-[#FFD700]/15 text-[#FFD700]/80 hover:text-[#FFD700] border border-[#FFD700]/20 rounded-lg text-[10px] font-black transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                    >
                      <Users className="w-3 h-3" />
                      {team.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-2 bg-white/[0.03] border border-white/[0.07] focus-within:border-[#FFD700]/40 rounded-xl transition-all p-2">
                <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message #${activeChannelInfo?.label}... (Enter to send)`}
                className="flex-1 bg-transparent resize-none text-[13px] text-white placeholder:text-gray-600 focus:outline-none max-h-28 min-h-[36px] leading-relaxed py-1 px-2"
                rows={1}
                maxLength={1000}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                  input.trim() && !sending
                    ? "bg-[#FFD700] text-black hover:bg-[#FACC15] shadow-[0_0_15px_rgba(255,215,0,0.4)] active:scale-95"
                    : "bg-white/[0.04] text-gray-600 cursor-not-allowed"
                }`}
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
              <LogIn className="w-4 h-4 text-gray-600" />
              <span className="text-[12px] text-gray-500">
                <Link href="/login" className="text-[#FFD700] hover:underline font-bold">Sign in</Link> to send messages
              </span>
            </div>
          )}
          <div className="flex justify-between mt-1.5 px-1">
            <span className="text-[10px] text-gray-700">MLBB Community Chat · Text only · Be respectful</span>
            <span className="text-[10px] text-gray-700">⌨ Enter to send, Shift+Enter for new line</span>
          </div>
        </div>
      </main>
      </div>
    </PageShell>
  );
}
