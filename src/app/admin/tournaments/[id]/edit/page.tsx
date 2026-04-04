import { Trophy, Swords, Calendar, Settings, Gamepad2, Share2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { PrizeDistribution } from "../../create/PrizeDistribution";
import RegionSelect from "@/components/ui/RegionSelect";

export default async function EditTournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "SUPERADMIN" && role !== "MODERATOR") {
    redirect("/");
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id }
  });

  if (!tournament) return notFound();

  async function updateTournament(formData: FormData) {
    "use server";
    const userRole = (await auth()?.then(s => s?.user as any))?.role;
    if (userRole !== "SUPERADMIN" && userRole !== "MODERATOR") return;

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const banner = formData.get("banner") as string;
    const gameMode = formData.get("gameMode") as any;
    const platform = formData.get("platform") as string;
    const format = formData.get("format") as any;
    const maxTeams = parseInt(formData.get("maxTeams") as string);
    const prizePool = formData.get("prizePool") as string;
    const entryFee = formData.get("entryFee") as string;
    const locationRestriction = formData.get("locationRestriction") as string;
    const startDate = new Date(formData.get("startDate") as string);
    
    await prisma.tournament.update({
      where: { id },
      data: {
        title, description, banner, gameMode, platform, format, locationRestriction: locationRestriction || null,
        maxTeams, prizePool, entryFee, startDate
      } as any
    });

    revalidatePath("/admin/tournaments");
    revalidatePath(`/tournaments/${id}`);
    redirect("/admin/tournaments");
  }

  // Helper to format datetime-local input safely
  const formatDateTimeLocal = (date: Date | null) => {
    if (!date) return "";
    const isoString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
    return isoString.slice(0, 16);
  };

  return (
    <div className="pb-24">
      <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
           <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200 mb-3 flex items-center gap-4 tracking-tight drop-shadow-lg">
             <Settings className="w-10 h-10 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
             Edit Tournament
           </h1>
           <p className="text-gray-400 font-bold text-lg max-w-2xl">Modify bracket metrics, prize distributions, and logistic parameters.</p>
        </div>

        {/* Public Share URL Box */}
        <div className="bg-[#111111]/80 border border-white/10 rounded-2xl p-4 min-w-[320px] shadow-lg">
           <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <Share2 className="w-3 h-3 text-blue-400" /> Public Share Link
           </div>
           <div className="flex items-center gap-2">
              <input 
                readOnly 
                value={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/t/${id}`} 
                className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-blue-300 font-mono outline-none focus:border-blue-500/50 transition-colors selection:bg-blue-500/30" 
              />
           </div>
        </div>
      </div>
      
      <form action={updateTournament} className="max-w-4xl space-y-6">
        {/* Basic Info */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-2xl p-6 lg:p-8 group hover:border-blue-500/20 transition-all duration-300 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-700" />
          <div className="relative z-10">
          <h2 className="text-xl font-black text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-500" /> General Details
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tournament Title</label>
                <input required defaultValue={tournament.title} name="title" type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 transition-colors outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Banner Image URL</label>
                <input name="banner" defaultValue={tournament.banner || ""} type="url" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 transition-colors outline-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description & Rules</label>
              <textarea required defaultValue={tournament.description || ""} name="description" rows={4} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 transition-colors outline-none resize-none" />
            </div>
          </div>
          </div>
        </div>

        {/* Game Rules */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-2xl p-6 lg:p-8 group hover:border-amber-500/20 transition-all duration-300 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-amber-500/10 transition-colors duration-700" />
          <div className="relative z-10">
          <h2 className="text-xl font-black text-amber-500 mb-6 border-b border-white/10 pb-4 flex items-center gap-3">
            <Gamepad2 className="w-5 h-5" /> MLBB Game Rules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Team Size (Mode)</label>
              <select required defaultValue={tournament.gameMode || "TEAM_5V5"} name="gameMode" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none appearance-none">
                <option value="TEAM_5V5">5v5 Squads</option>
                <option value="TRIO_3V3">3v3 Trios</option>
                <option value="DUO_2V2">2v2 Duos</option>
                <option value="SOLO_1V1">1v1 Solo Combat</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Match Lobby Type</label>
              <select required defaultValue={tournament.platform || "Classic"} name="platform" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none appearance-none">
                <option value="Draft Pick">Draft Pick</option>
                <option value="Classic">Classic</option>
                <option value="Brawl">Brawl</option>
                <option value="Custom / Arcade">Custom / Arcade</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bracket Format</label>
              <select required defaultValue={tournament.format || "SINGLE_ELIMINATION"} name="format" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none appearance-none">
                <option value="SINGLE_ELIMINATION">Single Elimination</option>
                <option value="DOUBLE_ELIMINATION">Double Elimination</option>
                <option value="ROUND_ROBIN">Round Robin</option>
              </select>
            </div>
            <div className="space-y-1.5 lg:col-span-3">
              <label className="text-xs font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2">Geographic Scope (Philippine Boundaries)</label>
              <RegionSelect fieldName="locationRestriction" defaultValue={(tournament as any).locationRestriction || ""} />
              <p className="text-[10px] text-gray-500 font-bold mt-1">Leave standard for <strong className="text-white">Nationwide</strong>, or explicitly select a Region Gate to bound participation.</p>
            </div>
          </div>
          </div>
        </div>

        {/* Logistics */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-2xl p-6 lg:p-8 group hover:border-blue-500/20 transition-all duration-300 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-700" />
          <div className="relative z-10">
          <h2 className="text-xl font-black text-blue-400 mb-6 border-b border-white/10 pb-4 flex items-center gap-3">
            <Calendar className="w-5 h-5" /> Logistics & Prizes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Max Participants</label>
              <input required defaultValue={tournament.maxTeams} name="maxTeams" type="number" min="2" max="512" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Start Date & Time</label>
              <input required defaultValue={formatDateTimeLocal(tournament.startDate)} name="startDate" type="datetime-local" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none" />
            </div>
             <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Entry Fee</label>
              <input required defaultValue={tournament.entryFee || "Free"} name="entryFee" type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none" />
            </div>
          </div>
          
          <PrizeDistribution initialPrizes={tournament.prizePool || undefined} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6">
           <a href={`/admin/tournaments`} className="px-6 py-4 bg-white/5 hover:bg-white/10 hover:shadow-lg text-white rounded-2xl text-sm font-black uppercase tracking-wider transition-all">Cancel</a>
           <button type="submit" className="px-10 py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-2xl text-sm font-black uppercase tracking-wider transition-all shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)] flex items-center gap-3 hover:-translate-y-1 relative z-20">
             <Settings className="w-6 h-6" /> Save Changes
           </button>
        </div>
      </form>
    </div>
  )
}
