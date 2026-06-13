import { User, Trophy, Target, Crosshair, UserPlus, UserCheck, MessageSquare, Clock, X } from "lucide-react";

interface UserProfileCardProps {
  user: {
    id: string;
    name: string | null;
    email?: string | null;
    image: string | null;
    mlbbId: string | null;
    server?: string | null;
    wins?: number;
    losses?: number;
  };
  currentUserId?: string | null;
  friendshipStatus?: "FRIENDS" | "PENDING_SENT" | "PENDING_RECEIVED" | "NONE" | "SELF";
  onAddFriend?: () => Promise<void>;
  onAcceptRequest?: () => Promise<void>;
  onSendMessage?: () => Promise<void>;
  onClose?: () => void;
}

export default function UserProfileCard({
  user,
  currentUserId,
  friendshipStatus = "NONE",
  onAddFriend,
  onAcceptRequest,
  onSendMessage,
  onClose,
}: UserProfileCardProps) {
  const wins = user.wins ?? 0;
  const losses = user.losses ?? 0;
  const total = wins + losses;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  return (
    <div className="gamer-id-card corner-accents p-0 relative" style={{ borderColor: "rgba(250, 204, 21, 0.15)" }}>
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-1 rounded bg-white/5 hover:bg-white/10 z-20 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Header Strip */}
      <div className="px-5 pt-4 pb-3 relative">
        <div className="flex items-center gap-1.5 mb-3">
          <Crosshair className="w-3 h-3 text-primary/60" />
          <span className="text-[9px] font-bold text-primary/60 uppercase tracking-[0.2em]">Gamer ID</span>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full p-[2px] flex-shrink-0 bg-gradient-to-br from-primary to-amber-600">
            <div className="w-full h-full rounded-full bg-[#0d0d0d] overflow-hidden flex items-center justify-center">
              {user.image ? (
                <img src={user.image} className="w-full h-full object-cover" alt="" />
              ) : (
                <User className="w-5 h-5 text-primary" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-white text-sm truncate uppercase tracking-wide">{user.name}</div>
            {user.mlbbId ? (
              <div className="text-[11px] text-gray-400 mt-0.5 font-medium flex items-center gap-1.5">
                <span className="text-primary">ID:</span> {user.mlbbId} 
                {user.server && <span className="text-gray-600">({user.server})</span>}
              </div>
            ) : (
              <div className="text-[11px] text-gray-500 truncate">{user.email}</div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 pb-4 space-y-3 border-b border-white/[0.05]">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2.5 text-center">
            <Trophy className="w-3.5 h-3.5 text-primary mx-auto mb-1" />
            <div className="text-base font-black text-primary leading-none">{wins}</div>
            <div className="text-[8px] text-gray-600 uppercase tracking-wider mt-0.5">Wins</div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2.5 text-center">
            <Target className="w-3.5 h-3.5 text-red-400 mx-auto mb-1" />
            <div className="text-base font-black text-red-400 leading-none">{losses}</div>
            <div className="text-[8px] text-gray-600 uppercase tracking-wider mt-0.5">Losses</div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2.5 text-center">
            <Crosshair className="w-3.5 h-3.5 text-primary mx-auto mb-1" />
            <div className="text-base font-black text-primary leading-none">{winRate}%</div>
            <div className="text-[8px] text-gray-600 uppercase tracking-wider mt-0.5">Rate</div>
          </div>
        </div>

        {/* Win Rate Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Win Rate</span>
            <span className="text-[10px] text-primary font-bold">{winRate}%</span>
          </div>
          <div className="stat-bar animate-pulse">
            <div className="stat-bar-fill" style={{ width: `${winRate}%` }} />
          </div>
        </div>
      </div>

      {/* Interactive Social Buttons (Only if not current user) */}
      {currentUserId && friendshipStatus !== "SELF" && (
        <div className="p-3 bg-black/40 flex items-center gap-2 rounded-b-xl border-t border-white/[0.02]">
          {friendshipStatus === "NONE" && onAddFriend && (
            <button
              onClick={onAddFriend}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-black hover:bg-yellow-400 active:scale-95 transition-all text-xs font-black uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(250,204,21,0.2)]"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Friend
            </button>
          )}

          {friendshipStatus === "PENDING_SENT" && (
            <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-white/10 bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider rounded-lg">
              <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              Pending
            </div>
          )}

          {friendshipStatus === "PENDING_RECEIVED" && onAcceptRequest && (
            <button
              onClick={onAcceptRequest}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 text-white hover:bg-emerald-400 active:scale-95 transition-all text-xs font-black uppercase tracking-wider rounded-lg"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Accept
            </button>
          )}

          {friendshipStatus === "FRIENDS" && (
            <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-primary/20 bg-primary/5 text-primary text-xs font-black uppercase tracking-wider rounded-lg">
              <UserCheck className="w-3.5 h-3.5" />
              Friends
            </div>
          )}

          {onSendMessage && (
            <button
              onClick={onSendMessage}
              className="px-3.5 py-2 bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 text-white rounded-lg transition-all active:scale-95 cursor-pointer"
              title="Send Direct Message"
            >
              <MessageSquare className="w-4 h-4 text-primary" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
