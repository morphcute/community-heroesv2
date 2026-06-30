"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ThumbsUp, Heart, Flame, Trophy,
  MessageSquare, Share2, Send, ImageIcon, X,
  Loader2, Sparkles, MoreHorizontal, Zap,
  Globe, ChevronDown, ChevronUp, SmilePlus,
  UserPlus, TrendingUp, Hash, Bell, Swords,
  CheckCheck, Camera,
} from "lucide-react";
import { createPost, addComment, toggleReaction } from "./actions";
import { sendFriendRequest } from "@/app/(dashboard)/chat/actions";

// ─── Types ───────────────────────────────────────────────────────────────────

type PostUser = {
  id: string;
  name: string | null;
  image: string | null;
  rank: string | null;
  mlbbId: string | null;
};

type PostComment = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    rank: string | null;
  };
};

type PostReaction = {
  id: string;
  userId: string;
  type: string;
};

type Post = {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  user: PostUser;
  comments: PostComment[];
  reactions: PostReaction[];
};

interface FeedClientProps {
  initialPosts: Post[];
  currentUserId: string;
  trendingTags: { tag: string; count: string }[];
  suggestedPlayers: { id: string; name: string; rank: string; mutual: number }[];
  activePlayers: number;
  scrimsToday: number;
  tournamentsLive: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getRankColor = (rank: string | null): string => {
  if (!rank) return "text-gray-500";
  const r = rank.toLowerCase();
  if (r.includes("immortal") || r.includes("glory")) return "text-purple-400";
  if (r.includes("mythic")) return "text-rose-400";
  if (r.includes("legend")) return "text-amber-400";
  if (r.includes("epic")) return "text-violet-400";
  if (r.includes("grandmaster")) return "text-orange-400";
  return "text-primary";
};

const getRankBadgeBg = (rank: string | null): string => {
  if (!rank) return "bg-white/5 border-white/10";
  const r = rank.toLowerCase();
  if (r.includes("immortal") || r.includes("glory")) return "bg-purple-500/10 border-purple-500/30";
  if (r.includes("mythic")) return "bg-rose-500/10 border-rose-500/30";
  if (r.includes("legend")) return "bg-amber-500/10 border-amber-500/30";
  if (r.includes("epic")) return "bg-violet-500/10 border-violet-500/30";
  return "bg-primary/10 border-primary/30";
};

const getRelativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getInitials = (name: string | null): string => {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
};

// ─── Reaction Config ──────────────────────────────────────────────────────────

const reactionConfig = [
  { type: "LIKE",   label: "Like",      emoji: "👍", icon: ThumbsUp, color: "text-primary", bg: "bg-primary/10 border-primary/30", glow: "shadow-primary/20" },
  { type: "LOVE",   label: "Love",      emoji: "❤️", icon: Heart,    color: "text-rose-400",   bg: "bg-rose-500/10 border-rose-500/30",   glow: "shadow-rose-500/20" },
  { type: "FIRE",   label: "Fire",      emoji: "🔥", icon: Flame,    color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/30", glow: "shadow-amber-500/20" },
  { type: "TROPHY", label: "Champion",  emoji: "🏆", icon: Trophy,   color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", glow: "shadow-yellow-500/20" },
];

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  user,
  size = "md",
  showStatus = false,
}: {
  user: { name: string | null; image: string | null; rank?: string | null };
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
}) {
  const sizeMap = {
    xs: "w-6 h-6 text-[9px]",
    sm: "w-8 h-8 text-[10px]",
    md: "w-10 h-10 text-xs",
    lg: "w-12 h-12 text-sm",
    xl: "w-14 h-14 text-base",
  };
  const dotMap = {
    xs: "w-1.5 h-1.5 border",
    sm: "w-2 h-2 border",
    md: "w-2.5 h-2.5 border-2",
    lg: "w-3 h-3 border-2",
    xl: "w-3.5 h-3.5 border-2",
  };

  return (
    <div className="relative flex-shrink-0">
      <div
        className={`${sizeMap[size]} rounded-full overflow-hidden bg-gradient-to-br from-yellow-500/20 to-amber-900/40 border border-primary/20 flex items-center justify-center font-black text-primary select-none`}
      >
        {user.image ? (
          <img src={user.image} className="w-full h-full object-cover" alt="" />
        ) : (
          <span>{getInitials(user.name)}</span>
        )}
      </div>
      {showStatus && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${dotMap[size]} bg-green-500 rounded-full border-black shadow-[0_0_6px_#22c55e]`}
        />
      )}
    </div>
  );
}


// ─── Publisher Box ────────────────────────────────────────────────────────────

function PublisherBox({
  onPublished,
  currentUser,
}: {
  onPublished: () => void;
  currentUser: { id: string; name?: string; image?: string | null };
}) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handlePublish = async () => {
    if (!content.trim() || publishing) return;
    setPublishing(true);
    const res = await createPost(content, imageUrl || undefined);
    if (res.ok) {
      setContent("");
      setImageUrl("");
      setShowImageInput(false);
      setFocused(false);
      onPublished();
    }
    setPublishing(false);
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-border/80">
      {/* Top strip accent */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="p-4 sm:p-5">
        <div className="flex gap-3 items-start">
          <Avatar
            user={{ name: currentUser.name ?? null, image: currentUser.image ?? null }}
            size="md"
            showStatus
          />
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="What's happening in the arena? Share a highlight, scrim result, or team update..."
              rows={focused ? 3 : 1}
              className="w-full bg-transparent text-[13px] sm:text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none leading-relaxed transition-all duration-200 min-h-[36px]"
              maxLength={2000}
              style={{ overflow: "hidden" }}
            />

            {focused && (
              <>
                {/* Divider */}
                <div className="h-px bg-white/5 my-3" />

                {/* Image URL input */}
                {showImageInput && (
                  <div className="relative mb-3">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Paste image URL (Imgur, Unsplash, etc.)..."
                      className="w-full bg-background/40 border border-border focus:border-primary/40 rounded-xl px-4 py-2.5 text-[12px] text-foreground placeholder:text-muted-foreground outline-none transition-all pr-10"
                    />
                    <button
                      onClick={() => { setImageUrl(""); setShowImageInput(false); }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Image preview */}
                {imageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-white/10 mb-3 bg-black/40 max-h-56">
                    <img src={imageUrl} className="w-full object-cover max-h-56" alt="Preview" />
                    <button
                      onClick={() => setImageUrl("")}
                      className="absolute top-2 right-2 bg-black/70 hover:bg-black p-1.5 rounded-full text-white border border-border transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Char count */}
                {content.length > 1700 && (
                  <div className="text-right text-[10px] mb-2 font-mono" style={{ color: content.length > 1950 ? "#ef4444" : "#94a3b8" }}>
                    {2000 - content.length}
                  </div>
                )}

                {/* Actions row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowImageInput(!showImageInput)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                        showImageInput || imageUrl
                          ? "bg-primary/10 border border-primary/25 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Photo</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                      <Swords className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Scrim</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                      <Hash className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Tag</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-muted-foreground border border-border rounded-lg px-2.5 py-1">
                      <Globe className="w-3 h-3" />
                      <span>Public</span>
                    </div>
                    <button
                      onClick={handlePublish}
                      disabled={!content.trim() || publishing}
                      className="px-5 py-2 bg-primary hover:bg-yellow-400 disabled:bg-muted disabled:text-muted-foreground text-black text-[12px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center gap-2 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(250,204,21,0.15)]"
                    >
                      {publishing ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Posting...</>
                      ) : (
                        <><Send className="w-3.5 h-3.5" /> Post</>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reaction Bar ─────────────────────────────────────────────────────────────

function ReactionBar({
  post,
  currentUserId,
  onReact,
}: {
  post: Post;
  currentUserId: string;
  onReact: (type: string) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    if (showPicker) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPicker]);

  const hasUserReacted = (type: string) =>
    post.reactions.some((r) => r.userId === currentUserId && r.type === type);

  const userReaction = reactionConfig.find((r) => hasUserReacted(r.type));

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setShowPicker(!showPicker)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-bold transition-all active:scale-95 w-full justify-center ${
          userReaction
            ? `${userReaction.color} ${userReaction.bg} border`
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        {userReaction ? (
          <span className="text-base leading-none">{userReaction.emoji}</span>
        ) : (
          <SmilePlus className="w-4 h-4" />
        )}
        <span>{userReaction ? userReaction.label : "React"}</span>
      </button>

      {/* Emoji picker popover */}
      {showPicker && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 flex items-center gap-1 bg-popover border border-border px-2 py-2 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {reactionConfig.map((r) => {
            const active = hasUserReacted(r.type);
            return (
              <button
                key={r.type}
                onClick={() => { onReact(r.type); setShowPicker(false); }}
                title={r.label}
                className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl transition-all hover:scale-125 active:scale-95 ${
                  active ? `${r.bg} border ${r.color} shadow-lg` : "hover:bg-muted"
                }`}
              >
                <span className="text-xl leading-none">{r.emoji}</span>
                <span className={`text-[8px] font-bold ${active ? r.color : "text-muted-foreground"}`}>{r.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({
  post,
  currentUserId,
  onUpdate,
}: {
  post: Post;
  currentUserId: string;
  onUpdate: () => void;
}) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");
  const [isPending, startTransition] = useTransition();
  const commentInputRef = useRef<HTMLInputElement>(null);

  const handleReact = async (type: string) => {
    startTransition(async () => {
      await toggleReaction(post.id, type);
      onUpdate();
    });
  };

  const handleComment = async () => {
    if (!commentText.trim() || commenting) return;
    setCommenting(true);
    const res = await addComment(post.id, commentText.trim());
    if (res.ok) {
      setCommentText("");
      onUpdate();
    }
    setCommenting(false);
  };

  const handleShare = () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/feed#post-${post.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setShareState("copied");
    setTimeout(() => setShareState("idle"), 3000);
  };

  const openComments = () => {
    setCommentsOpen(true);
    setTimeout(() => commentInputRef.current?.focus(), 100);
  };

  // Reaction summary
  const reactionSummary = reactionConfig
    .map((r) => ({
      ...r,
      count: post.reactions.filter((rx) => rx.type === r.type).length,
    }))
    .filter((r) => r.count > 0);

  const totalReactions = post.reactions.length;
  const totalComments = post.comments.length;

  return (
    <article
      id={`post-${post.id}`}
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-border/80"
    >
      {/* Post Header */}
      <div className="p-4 sm:p-5 pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <Avatar user={post.user} size="md" showStatus />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-foreground text-[13px] sm:text-sm hover:text-primary transition-colors cursor-pointer truncate">
                  {post.user.name || "Unknown"}
                </span>
                {post.user.rank && (
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRankBadgeBg(post.user.rank)} ${getRankColor(post.user.rank)}`}
                  >
                    {post.user.rank}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Globe className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">{getRelativeTime(post.createdAt)}</span>
              </div>
            </div>
          </div>
          <button className="flex-shrink-0 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Post Body */}
        <div className="mt-4 space-y-3">
          <p className="text-[13px] sm:text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
            {post.content}
          </p>
        </div>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="mt-4 mx-0 bg-background/40 border-y border-border overflow-hidden max-h-[420px]">
          <img
            src={post.imageUrl}
            className="w-full object-cover max-h-[420px]"
            alt="Post attachment"
            loading="lazy"
          />
        </div>
      )}

      {/* Reaction Summary Bar */}
      {(totalReactions > 0 || totalComments > 0) && (
        <div className="mx-4 sm:mx-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {reactionSummary.length > 0 && (
              <>
                <div className="flex -space-x-1.5">
                  {reactionSummary.slice(0, 3).map((r) => (
                    <div
                      key={r.type}
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border border-card leading-none ${r.bg}`}
                    >
                      {r.emoji}
                    </div>
                  ))}
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">{totalReactions}</span>
              </>
            )}
          </div>
          {totalComments > 0 && (
            <button
              onClick={() => setCommentsOpen(!commentsOpen)}
              className="text-[11px] text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              {totalComments} {totalComments === 1 ? "comment" : "comments"}
            </button>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="mx-4 sm:mx-5 h-px bg-border" />

      {/* Action Buttons */}
      <div className="px-2 sm:px-4 py-1 grid grid-cols-3 gap-1">
        <ReactionBar post={post} currentUserId={currentUserId} onReact={handleReact} />

        <button
          onClick={openComments}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-bold transition-all justify-center ${
            commentsOpen
              ? "text-primary bg-primary/10 border border-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comment</span>
        </button>

        <button
          onClick={handleShare}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-bold transition-all justify-center ${
            shareState === "copied"
              ? "text-green-400 bg-green-500/10 border border-green-500/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          {shareState === "copied" ? (
            <><CheckCheck className="w-4 h-4" /><span>Copied!</span></>
          ) : (
            <><Share2 className="w-4 h-4" /><span>Share</span></>
          )}
        </button>
      </div>

      {/* Comments Drawer */}
      {commentsOpen && (
        <div className="border-t border-border">
          {/* Existing comments */}
          {post.comments.length > 0 && (
            <div className="px-4 sm:px-5 pt-4 space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
              {post.comments.map((c) => (
                <div key={c.id} className="flex gap-2.5 items-start group">
                  <Avatar user={c.user} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="bg-muted border border-border rounded-2xl rounded-tl-sm px-3.5 py-2.5 inline-block max-w-full">
                      <div className="flex items-baseline gap-2 flex-wrap mb-1">
                        <span className="font-black text-foreground text-[11px]">{c.user.name || "User"}</span>
                        {c.user.rank && (
                          <span className={`text-[9px] font-bold ${getRankColor(c.user.rank)}`}>{c.user.rank}</span>
                        )}
                      </div>
                      <p className="text-[12px] text-foreground/80 leading-relaxed break-words">{c.content}</p>
                    </div>
                    <div className="mt-1 ml-2 text-[10px] text-muted-foreground">{getRelativeTime(c.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comment input */}
          <div className="p-4 sm:p-5 pt-3 flex gap-2.5 items-center">
            <Avatar user={{ name: "Me", image: null }} size="sm" />
            <div className="flex-1 flex items-center gap-2 bg-muted border border-border focus-within:border-primary/30 focus-within:shadow-[0_0_12px_rgba(250,204,21,0.06)] rounded-2xl px-4 py-2 transition-all">
              <input
                ref={commentInputRef}
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleComment();
                  }
                }}
                placeholder="Write a comment..."
                className="flex-1 bg-transparent text-[12px] text-foreground outline-none placeholder:text-muted-foreground min-w-0"
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim() || commenting}
                className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${
                  commentText.trim() && !commenting
                    ? "text-primary hover:bg-primary/10 cursor-pointer"
                    : "text-muted-foreground/50 cursor-not-allowed"
                }`}
              >
                {commenting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

// ─── Right Sidebar ────────────────────────────────────────────────────────────

function RightSidebar({
  trendingTags,
  suggestedPlayers,
  activePlayers,
  scrimsToday,
  tournamentsLive,
}: {
  trendingTags: { tag: string; count: string }[];
  suggestedPlayers: { id: string; name: string; rank: string; mutual: number }[];
  activePlayers: number;
  scrimsToday: number;
  tournamentsLive: number;
}) {
  const [friendStatus, setFriendStatus] = useState<Record<string, string>>({});

  const handleFollow = async (id: string) => {
    setFriendStatus((prev) => ({ ...prev, [id]: "sending" }));
    try {
      const res = await sendFriendRequest(id);
      if (res.ok) {
        setFriendStatus((prev) => ({ ...prev, [id]: "sent" }));
      } else {
        alert(res.message);
        setFriendStatus((prev) => ({ ...prev, [id]: "" }));
      }
    } catch (err) {
      console.error(err);
      setFriendStatus((prev) => ({ ...prev, [id]: "" }));
    }
  };

  return (
    <div className="space-y-5">
      {/* Trending Section */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-black text-foreground uppercase tracking-wider">Trending in CH</span>
        </div>
        <div className="px-2 pb-2">
          {trendingTags.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">No trending hashtags yet.</div>
          ) : (
            trendingTags.map((item, i) => (
              <button
                key={item.tag}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-left group"
              >
                <div>
                  <div className="text-[10px] text-muted-foreground font-medium">#{i + 1} · Esports</div>
                  <div className="text-[12px] font-black text-foreground group-hover:text-primary transition-colors">
                    #{item.tag}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{item.count}</div>
                </div>
                <Hash className="w-4 h-4 text-muted-foreground group-hover:text-primary/60 transition-colors" />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Suggested Players */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-black text-foreground uppercase tracking-wider">Players to Follow</span>
        </div>
        <div className="px-2 pb-3">
          {suggestedPlayers.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">No suggested players.</div>
          ) : (
            suggestedPlayers.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-amber-900/40 border border-primary/20 flex items-center justify-center text-[11px] font-black text-primary flex-shrink-0">
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-black text-foreground truncate">{p.name}</div>
                  <div className={`text-[10px] font-bold ${getRankColor(p.rank)}`}>{p.rank}</div>
                  <div className="text-[10px] text-muted-foreground">{p.mutual} mutual friends</div>
                </div>
                <button
                  disabled={friendStatus[p.id] === "sending" || friendStatus[p.id] === "sent"}
                  onClick={() => handleFollow(p.id)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/25 text-primary text-[10px] font-black uppercase tracking-wide hover:bg-primary/20 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {friendStatus[p.id] === "sending" ? "..." : friendStatus[p.id] === "sent" ? "Sent" : "Add"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Arena Status widget */}
      <div className="bg-card border border-primary/15 rounded-2xl overflow-hidden">
        <div className="h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-black text-primary uppercase tracking-wider">Live Arena Mode</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">Active Players</span>
              <span className="text-foreground font-bold">{activePlayers}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">Scrims Today</span>
              <span className="text-primary font-bold">{scrimsToday}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">Tournaments Live</span>
              <span className="text-green-400 font-bold">{tournamentsLive}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeedClient({
  initialPosts,
  currentUserId,
  suggestedPlayers,
  trendingTags,
  activePlayers,
  scrimsToday,
  tournamentsLive,
}: FeedClientProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<"all" | "mine">("all");

  const handleUpdate = () => router.refresh();

  const filteredPosts =
    activeFilter === "mine"
      ? initialPosts.filter((p) => p.user.id === currentUserId)
      : initialPosts;

  // dummy current user for publisher
  const currentUser = { id: currentUserId, name: undefined, image: undefined };

  return (
    <div className="min-h-screen w-full">
      {/* Hero Banner */}
      <div className="relative overflow-hidden border-b border-border bg-card/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(250,204,21,0.07)_0%,transparent_60%)] pointer-events-none" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="inline-flex items-center gap-2 text-primary text-[11px] font-black uppercase tracking-[0.2em]">
              <Sparkles className="w-3.5 h-3.5" />
              Arena Hub
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </div>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-foreground mb-2">
            Arena <span className="text-gradient-primary">Feed</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Share tournament highlights, scrim results, and team updates with the Community Heroes network.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 lg:gap-8 items-start">

          {/* CENTER COLUMN: Feed */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Publisher Box */}
            <PublisherBox onPublished={handleUpdate} currentUser={currentUser} />

            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              {(["all", "mine"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                    activeFilter === f
                      ? "bg-primary text-black shadow-[0_0_15px_rgba(250,204,21,0.2)]"
                      : "text-muted-foreground hover:text-foreground bg-card border border-border"
                  }`}
                >
                  {f === "all" ? "All Posts" : "My Posts"}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
                {filteredPosts.length} posts
              </div>
            </div>

            {/* Posts */}
            {filteredPosts.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <Sparkles className="w-10 h-10 text-muted-foreground/60 mx-auto mb-4" />
                <div className="text-sm font-black text-muted-foreground uppercase tracking-wider mb-2">
                  {activeFilter === "mine" ? "You haven't posted yet" : "No posts yet"}
                </div>
                <div className="text-[12px] text-muted-foreground/80">
                  Be the first to share an arena moment with the community!
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId}
                    onUpdate={handleUpdate}
                  />
                ))}
              </div>
            )}

            {/* Load more placeholder */}
            {filteredPosts.length > 0 && (
              <div className="text-center py-4">
                <div className="text-[11px] text-muted-foreground/60 font-bold uppercase tracking-wider">
                  · You're all caught up ·
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: Only visible on xl+ */}
          <div className="hidden xl:block w-[320px] flex-shrink-0 sticky top-6">
            <RightSidebar
              trendingTags={trendingTags}
              suggestedPlayers={suggestedPlayers}
              activePlayers={activePlayers}
              scrimsToday={scrimsToday}
              tournamentsLive={tournamentsLive}
            />
          </div>
        </div>

        {/* Mobile-only Right Sidebar content (below feed) */}
        <div className="xl:hidden mt-6">
          <RightSidebar
            trendingTags={trendingTags}
            suggestedPlayers={suggestedPlayers}
            activePlayers={activePlayers}
            scrimsToday={scrimsToday}
            tournamentsLive={tournamentsLive}
          />
        </div>
      </div>
    </div>
  );
}
