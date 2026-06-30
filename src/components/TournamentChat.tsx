"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, Loader2, AlertCircle, LogIn, Shield, Swords, Axe, Flame, Target, Trophy, type LucideIcon } from "lucide-react";
import Link from "next/link";

type MessageUser = {
  id: string;
  name: string | null;
  image: string | null;
  rank: string | null;
  mlbbId: string | null;
  roles?: string[];
};

type ChatMessage = {
  id: string;
  content: string;
  channel: string | null;
  createdAt: string;
  user: MessageUser;
};

type RoleBadgeConfig = { label: string; color: string; icon: LucideIcon };

const ROLE_BADGES: Record<string, RoleBadgeConfig> = {
  "TANK_SUPPORT": { label: "Roamer", color: "text-green-400 bg-green-400/10 border-green-400/30 shadow-[0_0_10px_rgba(74,222,128,0.15)]", icon: Shield },
  "FIGHTER": { label: "EXP Laner", color: "text-orange-400 bg-orange-400/10 border-orange-400/30 shadow-[0_0_10px_rgba(251,146,60,0.15)]", icon: Swords },
  "JUNGLER": { label: "Jungler", color: "text-purple-400 bg-purple-400/10 border-purple-400/30 shadow-[0_0_10px_rgba(192,132,252,0.15)]", icon: Axe },
  "MAGE": { label: "Mid Laner", color: "text-slate-400 bg-slate-400/10 border-slate-400/30 shadow-[0_0_10px_rgba(148,163,184,0.15)]", icon: Flame },
  "MARKSMAN": { label: "Gold Laner", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30 shadow-[0_0_10px_rgba(250,204,21,0.15)]", icon: Target },
};

const getRankShort = (rank: string) => {
  const r = rank.toLowerCase();
  if (r.includes("immortal")) return "MI";
  if (r.includes("glory")) return "MG";
  if (r.includes("honor")) return "MH";
  if (r.includes("mythic")) return "M";
  if (r.includes("legend")) return "L";
  if (r.includes("epic")) return "E";
  if (r.includes("grandmaster")) return "GM";
  if (r.includes("master")) return "MS";
  if (r.includes("elite")) return "EL";
  if (r.includes("warrior")) return "W";
  return null;
};

interface TournamentChatProps {
  tournamentId: string;
  currentUserId: string | null;
}

export default function TournamentChat({ tournamentId, currentUserId }: TournamentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/messages?tournamentId=${tournamentId}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data: ChatMessage[] = await res.json();
      setMessages(data);
      setError(null);
    } catch {
      setError("Could not load chat messages. Retrying...");
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    fetchMessages();

    pollRef.current = setInterval(fetchMessages, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending || !currentUserId) return;

    const content = input.trim();
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          tournamentId,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      await fetchMessages();
    } catch {
      setError("Failed to send message.");
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex flex-col h-[520px] rounded-2xl border border-white/10 bg-[#070b19]/90 shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-display text-sm font-bold uppercase tracking-wider text-slate-300">Live Bracket Chat</span>
        </div>
        <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">{messages.length} messages</span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {loading && messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs">Loading tournament chat...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-slate-500">
            <Trophy className="h-8 w-8 mb-2 opacity-30" />
            <span className="text-xs">Welcome to the lobby! Say hello below.</span>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user.id === currentUserId;
            const rankShort = msg.user.rank ? getRankShort(msg.user.rank) : null;

            return (
              <div key={msg.id} className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                {/* User Avatar */}
                <div className="relative group flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[#081225] text-xs font-black text-primary">
                    {msg.user.image ? (
                      <img src={msg.user.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      (msg.user.name || "P").charAt(0).toUpperCase()
                    )}
                  </div>
                  {rankShort && (
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-black/70 border border-primary/40 flex items-center justify-center backdrop-blur-sm">
                      <span className="text-[7px] font-black text-primary leading-none">{rankShort}</span>
                    </div>
                  )}
                </div>

                {/* Message Body */}
                <div className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-300">
                      {msg.user.name || "Unknown"}
                    </span>
                    {msg.user.roles?.map((r) => {
                      const badge = ROLE_BADGES[r];
                      if (!badge) return null;
                      const IconComp = badge.icon;
                      return (
                        <span key={r} className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[8px] font-bold border border-white/10 ${badge.color}`}>
                          <IconComp className="h-2 w-2" />
                          {badge.label}
                        </span>
                      );
                    })}
                  </div>
                  <div className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed border transition-all ${
                    isMe
                      ? "bg-primary text-black border-primary/20 shadow-[0_0_15px_rgba(250,204,21,0.1)] rounded-tr-none"
                      : "bg-white/5 text-slate-200 border-white/5 rounded-tl-none hover:border-white/10"
                  }`}>
                    {msg.content}
                  </div>
                  <span className="mt-1 text-[8px] text-slate-500">{formatTime(msg.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-2 border-t border-red-500/10 bg-red-500/5 px-4 py-2 text-xs text-red-400">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-white/5 bg-white/[0.01] p-3">
        {currentUserId ? (
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Post a coordinate, draft note, or shoutout..."
              maxLength={400}
              className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-primary/50 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-black hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:hover:bg-primary"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-3 text-xs text-slate-400">
            <span>You must be logged in to participate in matches chat.</span>
            <Link href="/login" className="flex items-center gap-1 font-bold text-primary hover:underline">
              <LogIn className="h-3.5 w-3.5" />
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
