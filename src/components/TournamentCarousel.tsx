"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Trophy, User, ArrowRight } from "lucide-react";

interface TournamentCarouselProps {
  tournaments: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    banner: string | null;
    prizePool: string | null;
    admins: Array<{
      user: {
        name: string | null;
        image: string | null;
      }
    }>;
  }>;
}

export default function TournamentCarousel({ tournaments }: TournamentCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (tournaments.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % tournaments.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [tournaments.length, isHovered]);

  if (tournaments.length === 0) {
    return (
      <div className="relative w-full min-h-[260px] overflow-hidden rounded-2xl border border-border bg-card flex items-center justify-center">
        <div className="text-center p-6">
          <Trophy className="h-10 w-10 mx-auto text-primary/40 mb-3" />
          <div className="text-sm font-bold text-slate-400">No featured tournament yet</div>
          <div className="mt-1 text-xs text-slate-500">Check back soon for the next event</div>
        </div>
      </div>
    );
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + tournaments.length) % tournaments.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % tournaments.length);
  };

  return (
    <div
      className="relative w-full min-h-[260px] overflow-hidden rounded-2xl border border-border bg-[#050814] flex flex-col justify-between group/carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      <div className="relative flex-1 flex flex-col justify-between p-5 sm:p-6 z-10">
        {tournaments.map((tournament, idx) => {
          const isActive = idx === currentIndex;
          if (!isActive) return null;

          const creator = tournament.admins[0]?.user;
          let prizeLabel = tournament.prizePool || "TBA";
          try {
            if (prizeLabel.trim().startsWith("{") || prizeLabel.trim().startsWith("[")) {
              const pData = JSON.parse(prizeLabel);
              prizeLabel = `${pData.total} ${pData.currency}`;
            }
          } catch {}

          const statusColors: Record<string, string> = {
            REGISTRATION_OPEN: "bg-amber-500/10 text-amber-400 border-amber-500/20",
            UPCOMING: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
            ONGOING: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          };

          const statusLabel: Record<string, string> = {
            REGISTRATION_OPEN: "Registration Open",
            UPCOMING: "Upcoming",
            ONGOING: "Ongoing",
          };

          return (
            <div key={tournament.id} className="flex-1 flex flex-col justify-between animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Background Image / Gradient */}
              {tournament.banner ? (
                <>
                  <img
                    src={tournament.banner}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-luminosity z-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050814] via-[#050814]/80 to-transparent z-0" />
                </>
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-amber-500/10 via-[#050814] to-[#050814] z-0" />
              )}

              {/* Top Row: Status Tag + Creator Info */}
              <div className="relative z-10 flex items-center justify-between gap-4">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${statusColors[tournament.status] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                  {statusLabel[tournament.status] || tournament.status}
                </span>
                
                {creator && (
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md py-1 pl-1 pr-3 rounded-full border border-white/5">
                    <div className="w-5 h-5 rounded-full overflow-hidden bg-muted flex items-center justify-center text-[8px] font-bold">
                      {creator.image ? (
                        <img src={creator.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-2.5 h-2.5 text-gray-400" />
                      )}
                    </div>
                    <span className="text-[9px] text-gray-300 font-bold uppercase tracking-wider truncate max-w-[100px]">
                      {creator.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Middle Row: Title + Description */}
              <div className="relative z-10 mt-4 flex-1">
                <h3 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-white line-clamp-1 group-hover/carousel:text-primary transition-colors">
                  {tournament.title}
                </h3>
                <div className="mt-2 flex items-center gap-2 text-xs font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                  <Trophy className="w-4 h-4" />
                  <span className="uppercase tracking-wider text-[10px]">Prize Pool:</span>
                  <span className="font-black">{prizeLabel}</span>
                </div>
              </div>

              {/* Bottom Row: View Button */}
              <div className="relative z-10 mt-4 flex items-center justify-between">
                <Link
                  href={`/tournaments/${tournament.id}`}
                  className="inline-flex items-center gap-2 h-10 px-6 bg-primary text-black font-black text-[10px] uppercase tracking-wider rounded-lg hover:bg-yellow-400 transition-all shadow-[0_0_20px_-5px_rgba(250,204,21,0.4)] hover:shadow-[0_0_25px_-3px_rgba(250,204,21,0.6)] group/btn"
                >
                  Enter Arena
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>

                {/* Slideshow Navigation (inside the bottom row) */}
                {tournaments.length > 1 && (
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1.5 rounded-lg border border-white/5">
                    <button
                      onClick={handlePrev}
                      className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1 px-1">
                      {tournaments.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          onClick={() => setCurrentIndex(dotIdx)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${dotIdx === currentIndex ? "w-4 bg-primary" : "w-1.5 bg-gray-600 hover:bg-gray-400"}`}
                          aria-label={`Go to slide ${dotIdx + 1}`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={handleNext}
                      className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
