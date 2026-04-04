import { User, Trophy, Target, Crosshair } from "lucide-react";

export default function UserProfileCard({ user }: { user: any }) {
  const wins = user.wins ?? 0;
  const losses = user.losses ?? 0;
  const total = wins + losses;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  return (
    <div className="gamer-id-card corner-accents p-0" style={{ borderColor: "rgba(255, 215, 0, 0.15)" }}>
      {/* Yellow Header Strip */}
      <div className="px-5 pt-4 pb-3 relative">
        <div className="flex items-center gap-1.5 mb-3">
          <Crosshair className="w-3 h-3 text-[#FFD700]/60" />
          <span className="text-[9px] font-bold text-[#FFD700]/60 uppercase tracking-[0.2em]">Gamer ID</span>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full p-[2px] flex-shrink-0" style={{ background: "linear-gradient(135deg, #FFD700, #F59E0B)" }}>
            <div className="w-full h-full rounded-full bg-[#0d0d0d] overflow-hidden flex items-center justify-center">
              {user.image ? (
                <img src={user.image} className="w-full h-full object-cover" alt="" />
              ) : (
                <User className="w-5 h-5 text-[#FFD700]" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-white text-sm truncate uppercase tracking-wide">{user.name}</div>
            {user.mlbbId ? (
              <div className="text-[11px] text-gray-400 mt-0.5 font-medium flex items-center gap-1.5">
                <span className="text-[#FFD700]">ID:</span> {user.mlbbId} 
                {user.server && <span className="text-gray-600">({user.server})</span>}
              </div>
            ) : (
              <div className="text-[11px] text-gray-500 truncate">{user.email}</div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 pb-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2.5 text-center">
            <Trophy className="w-3.5 h-3.5 text-[#FFD700] mx-auto mb-1" />
            <div className="text-base font-black text-[#FFD700] leading-none">{wins}</div>
            <div className="text-[8px] text-gray-600 uppercase tracking-wider mt-0.5">Wins</div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2.5 text-center">
            <Target className="w-3.5 h-3.5 text-red-400 mx-auto mb-1" />
            <div className="text-base font-black text-red-400 leading-none">{losses}</div>
            <div className="text-[8px] text-gray-600 uppercase tracking-wider mt-0.5">Losses</div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2.5 text-center">
            <Crosshair className="w-3.5 h-3.5 text-[#FFD700] mx-auto mb-1" />
            <div className="text-base font-black text-[#FFD700] leading-none">{winRate}%</div>
            <div className="text-[8px] text-gray-600 uppercase tracking-wider mt-0.5">Rate</div>
          </div>
        </div>

        {/* Win Rate Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Win Rate</span>
            <span className="text-[10px] text-[#FFD700] font-bold">{winRate}%</span>
          </div>
          <div className="stat-bar">
            <div className="stat-bar-fill" style={{ width: `${winRate}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
