import { prisma } from "@/lib/prisma";
import TournamentsClient from "./TournamentsClient";
import {
  getBattlefieldLabel,
  getGameModeLabel,
  getTournamentFormatLabel,
} from "@/lib/tournament-config";

export default async function TournamentsPage() {
  const tournamentsData = await prisma.tournament.findMany({
    include: {
      participants: true,
      admins: { include: { user: true } }
    },
    orderBy: { startDate: 'asc' }
  });

  const generateGradient = (seed: string) => {
    const gradients = [
      "from-slate-600/40 to-zinc-500/20",
      "from-red-600/40 to-orange-500/20",
      "from-amber-600/40 to-yellow-500/20",
      "from-purple-600/40 to-fuchsia-500/20",
      "from-green-600/40 to-emerald-500/20"
    ];
    let sum = 0;
    for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
    return gradients[sum % gradients.length];
  }

  const mapped = tournamentsData.map(t => {
    let formattedPrize = t.prizePool || "TBA";
    try {
      if (formattedPrize.trim().startsWith("{") || formattedPrize.trim().startsWith("[")) {
        const pData = JSON.parse(formattedPrize);
        formattedPrize = `${pData.total} ${pData.currency}`;
      }
    } catch { }

    const primaryHost = t.admins?.[0]?.user?.name || t.admins?.[0]?.user?.email?.split('@')[0] || "Community Heroes";

    return {
      id: t.id,
      name: t.title,
      host: primaryHost,
      date: t.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      prize: formattedPrize,
      participants: t.participants.filter(p => p.status === "APPROVED").length,
      maxParticipants: t.maxTeams,
      game: `MLBB ${getGameModeLabel(t.gameMode)}`,
      status: t.status === "ONGOING" ? "Live" : t.status === "REGISTRATION_OPEN" ? "Open" : t.status === "COMPLETED" ? "Completed" : "Upcoming",
      format: getTournamentFormatLabel(t.format),
      type: t.locationRestriction ? t.locationRestriction.toUpperCase() : getBattlefieldLabel((t as any).battlefield || "ONLINE"),
      platform: (t as any).matchMode || "Draft Pick",
      color: generateGradient(t.id),
      banner: t.banner || "/ch-logo.png",
      fee: t.entryFee || "Free",
      locationRestriction: (t as any).locationRestriction || null
    };
  });

  return <TournamentsClient initialTournaments={mapped} />;
}
