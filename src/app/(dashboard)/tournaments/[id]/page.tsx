import Link from "next/link";
import { auth } from "@/auth";
import {
  Trophy,
  Calendar,
  Users,
  Share2,
  Info,
  UserPlus,
  Send,
  Clock,
  ShieldCheck,
  MoreVertical,
  CheckCircle2,
  MapPin,
  Gamepad2,
  Monitor,
  Crown,
  Award,
  Star,
  Zap,
  Target,
  Coins,
  BookOpen,
  MessageSquare,
  Settings,
  Smartphone,
  User,
  Ticket,
  Network
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import JoinTournamentForm from "./JoinTournamentForm";
import TournamentChat from "@/components/TournamentChat";
import { updateMatchScore } from "../actions";
import {
  getBattlefieldLabel,
  getGameModeLabel,
  getStageSummary,
  getTournamentFormatLabel,
} from "@/lib/tournament-config";

export default async function TournamentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const session = await auth();

  // Fetch Real Data
  const tournamentData = await prisma.tournament.findUnique({
    where: { id },
    include: {
      admins: {
        include: {
          user: true
        }
      },
      participants: {
        include: {
          user: true,
          team: true
        }
      },
      messages: {
        include: {
          user: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  });

  if (!tournamentData) {
    notFound();
  }

  // @ts-ignore - Fetch binary tree separately due to transient Prisma client EPERM lock
  const matchesData = await prisma.match.findMany({
    where: { tournamentId: id },
    include: {
      participant1: { include: { user: true, team: true } },
      participant2: { include: { user: true, team: true } },
      winner: { include: { user: true, team: true } }
    },
    orderBy: [{ round: 'asc' }, { matchIndex: 'asc' }]
  }) || [];

  // Group matches by round structurally
  const matchesByRound = matchesData.reduce((acc: any, m: any) => {
    if (!acc[m.round]) acc[m.round] = [];
    acc[m.round].push(m);
    return acc;
  }, {});

  const currentUser = session?.user?.email
    ? await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        teamMembers: {
          select: { teamId: true }
        }
      }
    })
    : null;

  const userCanEditBracket =
    (session?.user as any)?.role === "SUPERADMIN" ||
    (currentUser && tournamentData.admins.some((a) => a.userId === currentUser.id));

  const userTeamIds = (currentUser?.teamMembers || []).map((member) => member.teamId);
  const alreadyJoined = currentUser
    ? tournamentData.participants.some(
      (participant) =>
        participant.userId === currentUser.id ||
        (participant.teamId ? userTeamIds.includes(participant.teamId) : false)
    )
    : false;

  const registrationIsOpen = ["UPCOMING", "REGISTRATION_OPEN"].includes(tournamentData.status);
  const startPretty = tournamentData.startDate.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
  const registrationMessage = alreadyJoined
    ? "You are already registered for this tournament"
    : registrationIsOpen
      ? `Starts on ${startPretty}`
      : "Registration is currently closed";

  const derivedRegions = Array.from(
    new Set(
      tournamentData.participants
        .map((participant) => {
          const address = participant.user?.address?.trim();
          if (!address) return null;
          const parts = address.split(",").map((segment) => segment.trim()).filter(Boolean);
          return parts[parts.length - 1] || null;
        })
        .filter((region): region is string => Boolean(region))
    )
  );

  const statusSteps = [
    { key: "UPCOMING", title: "Upcoming", subtitle: "Tournament is scheduled to start" },
    { key: "REGISTRATION_OPEN", title: "Registrations Open", subtitle: "Players can register for the tournament" },
    { key: "REGISTRATION_CLOSED", title: "Registrations Closed", subtitle: "Registration period has ended" },
    { key: "ONGOING", title: "Tournament In Progress", subtitle: "Tournament is currently running" },
    { key: "COMPLETED", title: "Tournament Completed", subtitle: "Tournament has finished" },
  ] as const;
  const activeStatusIndex = statusSteps.findIndex((step) => step.key === tournamentData.status);

  // Format Data for UI
  let formattedPrize = tournamentData.prizePool || "TBA";
  try {
    if (formattedPrize.trim().startsWith("{") || formattedPrize.trim().startsWith("[")) {
      const pData = JSON.parse(formattedPrize);
      formattedPrize = `${pData.total} ${pData.currency}`;
    }
  } catch { }

  const tournament = {
    id: tournamentData.id,
    title: tournamentData.title,
    description: tournamentData.description,
    mode: getGameModeLabel(tournamentData.gameMode),
    matchMode: (tournamentData as any).matchMode || "Draft Pick",
    prize: formattedPrize,
    status: tournamentData.status.replace('_', ' '),
    startDate: tournamentData.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }),
    endDate: tournamentData.endDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }),
    participants: tournamentData.participants.length,
    maxParticipants: tournamentData.maxTeams,
    battlefield: getBattlefieldLabel((tournamentData as any).battlefield || "ONLINE"),
    fee: tournamentData.entryFee || "Free for all",
    bracketType: getTournamentFormatLabel(tournamentData.format),
    stages: getStageSummary((tournamentData as any).stageType || "SINGLE_STAGE", (tournamentData as any).stageCount || 1),
    regions: derivedRegions,
    image: tournamentData.banner || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop"
  };

  const admins = tournamentData.admins.map(a => ({
    id: a.user.id,
    name: a.user.name || "Unknown",
    role: a.role === 'ADMIN' ? 'Tournament Admin' : 'Moderator',
    color: a.role === 'ADMIN' ? 'bg-primary' : 'bg-blue-500'
  }));

  const participantsList = tournamentData.participants.map(p => ({
    id: p.id,
    name: p.user?.name || p.team?.name || "Unknown",
    avatar: p.user?.image || p.team?.logo || "",
    status: p.status,
    joinedAt: p.joinedAt,
    mlbbId: p.user?.mlbbId || "N/A",
    inGameName: p.user?.name || p.team?.name || "Unknown"
  }));

  const messages = tournamentData.messages.map(m => ({
    id: m.id,
    user: m.user.name || "Unknown",
    content: m.content,
    time: m.createdAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' }),
    avatar: (m.user.name || "U").charAt(0).toUpperCase(),
    color: ['bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-orange-600'][m.user.id.charCodeAt(0) % 4],
    isMe: false
  }));

  const validTabs = ["overview", "matches", "bracket", "chat", "prizes", "participants", "rules"] as const;
  const tabParam = resolvedSearchParams.tab;
  const tabValue = Array.isArray(tabParam) ? tabParam[0] : tabParam;
  const activeTab = validTabs.includes((tabValue || "").toLowerCase() as (typeof validTabs)[number])
    ? ((tabValue || "").toLowerCase() as (typeof validTabs)[number])
    : "overview";

  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans">
      {/* Black & Yellow Header Overlay */}
      <div className="relative w-full h-[380px] bg-[#0a0a0a] overflow-hidden border-b border-white/[0.05]">
        {/* Background Banner mapped to the right */}
        <div className="absolute top-0 right-0 w-full md:w-[60%] h-full">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/50 z-10" />
          <img src={tournament.image} alt="Banner" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
        </div>

        <div className="relative z-20 container mx-auto px-6 h-full flex flex-col justify-center mt-4">
          {/* Back Button */}
          <Link href="/tournaments" className="flex items-center gap-2 text-[10px] text-gray-500 hover:text-primary uppercase font-black mb-8 transition-colors w-fit tracking-widest bg-white/[0.02] px-3 py-1.5 rounded border border-white/[0.05]">
            <span className="text-sm leading-none -mt-0.5">←</span> Back to Arena
          </Link>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 mb-3 tracking-tight uppercase drop-shadow-[0_0_15px_rgba(255,215,0,0.1)]">
            {tournament.title}
          </h1>

          {/* Sub-info Row */}
          <div className="flex flex-wrap items-center gap-4 md:gap-8 text-sm font-bold mb-8">
            <span className="text-gray-400 flex items-center gap-2 uppercase tracking-widest text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-primary/70" />
              {tournament.startDate} {tournament.endDate ? `→ ${tournament.endDate}` : ''}
            </span>
            <span className="text-primary flex items-center gap-2 uppercase tracking-widest text-[11px] drop-shadow-[0_0_8px_rgba(250,204,21,0.3)]">
              <Trophy className="w-3.5 h-3.5" /> {tournament.prize}
            </span>
            <span className="text-green-400 flex items-center gap-2 uppercase tracking-widest text-[11px] bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
              {tournament.fee}
            </span>
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-4 relative">
            {alreadyJoined ? (
              <div className="flex flex-col gap-2">
                <button disabled className="px-8 py-3 bg-white/5 text-primary border border-emerald-500/30 text-xs font-black rounded uppercase tracking-widest flex items-center justify-center gap-2 w-fit cursor-default shadow-[inset_0_0_20px_rgba(250,204,21,0.1)]">
                  <CheckCircle2 className="w-4 h-4" /> Registered
                </button>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">You are in the roster</span>
              </div>
            ) : registrationIsOpen ? (
              <div className="w-fit">
                <JoinTournamentForm tournamentId={tournamentData.id} alreadyJoined={alreadyJoined} registrationMessage={registrationMessage} />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button disabled className="px-8 py-3 bg-[#0a0a0a] border border-white/5 text-gray-500 text-xs font-black rounded uppercase tracking-widest cursor-not-allowed w-fit">
                  Registration Closed
                </button>
                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{registrationMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-white/[0.05] bg-[#0a0a0a]/95 backdrop-blur-xl sticky top-0 z-30 shadow-2xl">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-2">
              <TabLink href={`/tournaments/${tournament.id}?tab=overview`} active={activeTab === "overview"}>Overview</TabLink>
              <TabLink href={`/tournaments/${tournament.id}?tab=matches`} active={activeTab === "matches"}>Matches</TabLink>
              <TabLink href={`/tournaments/${tournament.id}?tab=bracket`} active={activeTab === "bracket"}>Bracket</TabLink>
              <TabLink href={`/tournaments/${tournament.id}?tab=chat`} active={activeTab === "chat"}>
                <div className="flex items-center gap-1.5">
                  {tournament.status === 'ONGOING' && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[pulse_1s_ease-in-out_infinite]" />}
                  Chat
                </div>
              </TabLink>
              <TabLink href={`/tournaments/${tournament.id}?tab=prizes`} active={activeTab === "prizes"}>Prizes</TabLink>
              <TabLink href={`/tournaments/${tournament.id}?tab=participants`} active={activeTab === "participants"}>Participants ({tournament.participants}/{tournament.maxParticipants})</TabLink>
              <TabLink href={`/tournaments/${tournament.id}?tab=rules`} active={activeTab === "rules"}>Rules</TabLink>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 pb-20">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Left Column: Details */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-black text-white mb-6 tracking-widest uppercase flex items-center gap-2">
                <div className="w-1 h-5 bg-primary rounded-sm" /> Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Organizer / Hosted By */}
                <div className="flex items-center gap-4 bg-[#0a0a0a] border border-white/[0.03] hover:border-primary/20 transition-colors rounded-2xl p-4 group">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/[0.05] group-hover:border-primary/30 group-hover:bg-primary/5 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-0.5">Hosted By</div>
                    <div className="text-sm font-bold text-gray-200 truncate max-w-[150px] group-hover:text-white transition-colors">
                      {tournamentData.admins[0]?.user?.name || tournamentData.admins[0]?.user?.email?.split('@')[0] || "Community Heroes"}
                    </div>
                  </div>
                </div>

                {/* Format */}
                <div className="flex items-center gap-4 bg-[#0a0a0a] border border-white/[0.03] hover:border-primary/20 transition-colors rounded-2xl p-4 group">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/[0.05] group-hover:border-primary/30 group-hover:bg-primary/5 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-0.5">Team Size</div>
                    <div className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{tournament.mode}</div>
                  </div>
                </div>

                {/* MLBB Mode */}
                <div className="flex items-center gap-4 bg-[#0a0a0a] border border-white/[0.03] hover:border-primary/20 transition-colors rounded-2xl p-4 group">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/[0.05] group-hover:border-primary/30 group-hover:bg-primary/5 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-0.5">MLBB Mode</div>
                    <div className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{tournament.matchMode}</div>
                  </div>
                </div>

                {/* Region Gate */}
                <div className="flex items-center gap-4 bg-[#0a0a0a] border border-white/[0.03] hover:border-primary/20 transition-colors rounded-2xl p-4 group">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/[0.05] group-hover:border-primary/30 group-hover:bg-primary/5 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-0.5">Region Gate</div>
                    <div className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{(tournamentData as any).locationRestriction || "Nationwide (Open)"}</div>
                  </div>
                </div>

                {/* Fee Entry */}
                <div className="flex items-center gap-4 bg-[#0a0a0a] border border-white/[0.03] hover:border-primary/20 transition-colors rounded-2xl p-4 group">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/[0.05] group-hover:border-primary/30 group-hover:bg-primary/5 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-0.5">Fee Entry</div>
                    <div className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{tournamentData.entryFee || "Free for all"}</div>
                  </div>
                </div>

                {/* Bracket Type */}
                <div className="flex items-center gap-4 bg-[#0a0a0a] border border-white/[0.03] hover:border-primary/20 transition-colors rounded-2xl p-4 group">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/[0.05] group-hover:border-primary/30 group-hover:bg-primary/5 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                    <Network className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-0.5">Bracket Type</div>
                    <div className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{tournament.bracketType}</div>
                  </div>
                </div>

                {/* Prize Pool */}
                <div className="flex items-center gap-4 bg-[#0a0a0a] border border-primary/20 hover:border-primary/40 transition-colors rounded-2xl p-4 shadow-[inset_0_0_20px_rgba(250,204,21,0.03)] group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[9px] text-primary/70 font-black uppercase tracking-[0.2em] mb-0.5">Prize Pool</div>
                    <div className="text-[15px] font-black text-white group-hover:text-primary transition-colors">
                      {(() => {
                        let prizeData: any = null;
                        try {
                          if (tournament.prize && (tournament.prize.trim().startsWith("{") || tournament.prize.trim().startsWith("["))) {
                            prizeData = JSON.parse(tournament.prize);
                          }
                        } catch { }
                        return prizeData ? `${Number(prizeData.total).toFixed(2)} ${prizeData.currency}` : tournament.prize || "TBA";
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-12">
                <h3 className="text-xl font-black text-white mb-6 tracking-widest uppercase flex items-center gap-2">
                  <div className="w-1 h-5 bg-[#FFD700] rounded-sm" /> Description
                </h3>
                <div className="text-sm text-gray-300 leading-relaxed font-medium bg-[#0a0a0a] p-6 lg:p-8 rounded-3xl border border-white/[0.03] shadow-lg">
                  {tournamentData.description || "No description provided."}
                </div>
              </div>
            </div>

            {/* Right Column: Status */}
            <div className="space-y-8">
              <div className="bg-[#0a0a0a] border border-white/[0.03] rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-xl">
                {/* Glowing Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] pointer-events-none -z-10" />

                <h3 className="text-xl font-black text-white mb-6 tracking-widest uppercase flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary rounded-sm" /> Timeline
                </h3>

                {/* Active Status Box */}
                <div className="bg-[#111111] border border-white/[0.05] rounded-2xl p-5 mb-8 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-[13px] font-black text-primary tracking-widest uppercase drop-shadow-[0_0_8px_rgba(250,204,21,0.3)] mb-1">
                      {statusSteps[Math.max(activeStatusIndex, 0)]?.title || "Status"}
                    </div>
                    <div className="text-xs text-gray-400 font-medium">
                      {registrationMessage}
                    </div>
                  </div>
                </div>

                {/* Timeline Tree */}
                <div className="space-y-0 relative pl-4 mt-4">
                  {/* Vertical Line */}
                  <div className="absolute left-[19px] top-3 bottom-0 w-[1.5px] bg-gradient-to-b from-primary/40 via-white/5 to-transparent" />

                  {statusSteps.map((step, index) => (
                    <TimelineStep
                      key={step.key}
                      status={step.title}
                      label={step.subtitle}
                      state={index < activeStatusIndex ? "completed" : index === activeStatusIndex ? "active" : "pending"}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "matches" && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20">
            {/* Phase Switcher */}
            <div className="mb-6">
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-3">Phases</div>
              <div className="flex items-center gap-2">
                <button className="px-5 py-2 hover:opacity-90 bg-primary text-black text-xs font-black uppercase tracking-wider rounded-full transition-opacity shadow-[0_0_15px_-3px_rgba(250,204,21,0.4)]">
                  Knockout
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Matches</label>
                <select className="appearance-none bg-[#1a1a1a] border border-white/5 hover:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 font-medium min-w-[140px] outline-none cursor-pointer transition-colors shadow-sm">
                  <option>My Matches</option>
                  <option>All Matches</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Group</label>
                <select className="appearance-none bg-[#1a1a1a] border border-white/5 hover:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 font-medium min-w-[140px] outline-none cursor-pointer transition-colors shadow-sm">
                  <option>Group A</option>
                  <option>Group B</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Round</label>
                <select className="appearance-none bg-[#1a1a1a] border border-white/5 hover:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 font-medium min-w-[140px] outline-none cursor-pointer transition-colors shadow-sm">
                  <option>All</option>
                  <option>Round 1</option>
                  <option>Round 2</option>
                </select>
              </div>
            </div>

            {/* Matches Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {matchesData.length === 0 ? (
                <div className="col-span-full py-20 text-center text-gray-500 font-medium">
                  Bracket matches have not been generated yet.
                </div>
              ) : (
                matchesData.map((m: any, idx: number) => {
                  const p1 = m.participant1;
                  const p2 = m.participant2;
                  const name1 = p1 ? (p1.user?.name || p1.team?.name || "TBD") : "TBD";
                  const name2 = p2 ? (p2.user?.name || p2.team?.name || "TBD") : "TBD";
                  const ava1 = p1 ? (p1.user?.image || p1.team?.logo) : null;
                  const ava2 = p2 ? (p2.user?.image || p2.team?.logo) : null;
                  const id1 = p1?.user?.mlbbId || p1?.teamId || "WAITING";
                  const id2 = p2?.user?.mlbbId || p2?.teamId || "WAITING";

                  return (
                    <div key={m.id} className="bg-[#0f0f0f]/80 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-colors flex flex-col shadow-xl">
                      {/* Top Bar */}
                      <div className="relative flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/[0.01]">
                        <div className="flex-1 text-center">
                          <div className="text-sm font-black text-gray-200 tracking-wide gap-1 flex items-center justify-center">MATCH <span className="text-white">{idx + 1}</span></div>
                          <div className={`text-[10px] font-black uppercase tracking-widest mt-1 ${m.status === 'COMPLETED' ? 'text-primary drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : m.status === 'ONGOING' ? 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'text-gray-600'}`}>
                            {m.status}
                          </div>
                        </div>
                        <button className="w-8 h-8 rounded-full bg-primary hover:bg-yellow-400 flex items-center justify-center transition-transform hover:scale-105 absolute right-5 shadow-[0_0_15px_-3px_rgba(250,204,21,0.4)]">
                          <MessageSquare className="w-4 h-4 text-black" fill="currentColor" strokeWidth={0} />
                        </button>
                      </div>

                      {/* Subtitle / Group */}
                      <div className="text-center py-4 bg-white/[0.005]">
                        <span className="text-[10px] font-black tracking-widest uppercase text-purple-400/90">Group {Math.ceil((idx + 1) / 4) || 1}</span>
                        <span className="text-[10px] text-gray-700 mx-3">•</span>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Round {m.round}</span>
                      </div>

                      {/* Players */}
                      <div className="flex items-center justify-between px-6 pb-8 pt-4">
                        {/* Player 1 */}
                        <div className="flex flex-col items-center gap-3 w-[80px]">
                          {ava1 ? (
                            <img src={ava1} alt={name1} className="w-16 h-16 rounded-full border border-white/10 object-cover shadow-lg" />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xl shadow-lg">
                              {name1.charAt(0)}
                            </div>
                          )}
                          <div className="text-center w-full">
                            <div className="text-xs font-bold text-primary truncate">{name1}</div>
                            <div className="text-[9px] font-mono text-gray-500 mt-1 opacity-80 truncate">{id1}</div>
                          </div>
                        </div>

                        {/* VS / Score */}
                        <div className="flex flex-col items-center justify-center px-4">
                          <div className="text-[10px] font-black text-red-500/80 mb-2">VS</div>
                          <div className="text-2xl font-black text-white mix-blend-screen">{m.score1} - {m.score2}</div>
                        </div>

                        {/* Player 2 */}
                        <div className="flex flex-col items-center gap-3 w-[80px]">
                          {ava2 ? (
                            <img src={ava2} alt={name2} className="w-16 h-16 rounded-full border border-white/10 object-cover shadow-lg" />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xl shadow-lg">
                              {name2.charAt(0)}
                            </div>
                          )}
                          <div className="text-center w-full">
                            <div className="text-xs font-bold text-gray-300 truncate">{name2}</div>
                            <div className="text-[9px] font-mono text-gray-500 mt-1 opacity-80 truncate">{id2}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>
        )}

        {activeTab === "bracket" && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-500 overflow-x-auto pb-10">
            <div className="min-w-max bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/5 rounded-3xl p-8 lg:p-12 shadow-2xl relative">

              {Object.keys(matchesByRound).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Share2 className="w-16 h-16 text-gray-700 mb-4" />
                  <h3 className="text-2xl font-black text-white">Bracket Pending</h3>
                  <p className="text-gray-500 mt-2 max-w-sm">The tournament tree will be mathematically generated the moment capacity is reached.</p>
                </div>
              ) : (
                <div className="flex gap-16 lg:gap-24">
                  {Object.entries(matchesByRound).sort(([a], [b]) => Number(a) - Number(b)).map(([roundStr, rMatches]: [string, any], rIndex, roundsArr) => {
                    const round = Number(roundStr);
                    const isFinal = round === roundsArr.length;

                    return (
                      <div key={round} className="flex flex-col justify-around gap-6 relative" style={{ minWidth: "280px" }}>
                        {/* Column Header */}
                        <div className="absolute -top-10 left-0 w-full text-center">
                          <div className="text-sm font-black text-gray-400 uppercase tracking-widest">
                            {isFinal ? "Grand Final" : `Round ${round}`}
                          </div>
                        </div>

                        {/* Matches */}
                        {rMatches.map((m: any) => {
                          const p1 = m.participant1;
                          const p2 = m.participant2;
                          const name1 = p1 ? (p1.user?.name || "Player 1") : "TBD";
                          const name2 = p2 ? (p2.user?.name || "Player 2") : "TBD";
                          const isP1Winner = m.winnerId && m.winnerId === p1?.id;
                          const isP2Winner = m.winnerId && m.winnerId === p2?.id;

                          const isEditingThis = userCanEditBracket && resolvedSearchParams.editMatch === m.id;

                          return (
                            <div key={m.id} className="relative group">
                              <div className={`rounded-xl border transition-all duration-300 shadow-lg relative z-10 ${m.status === 'ONGOING' ? 'bg-primary/5 border-primary/50 shadow-[0_0_15px_-3px_rgba(250,204,21,0.3)]' :
                                  m.status === 'COMPLETED' ? 'bg-[#1A1A1A] border-primary/20 border-l-4 border-l-primary' :
                                    'bg-[#111111] border-white/5 opacity-70'
                                }`}>
                                {userCanEditBracket && !isEditingThis && m.status !== "PENDING" && (
                                  <Link
                                    href={`/tournaments/${tournament.id}?tab=bracket&editMatch=${m.id}`}
                                    className="absolute -top-3 -right-3 w-8 h-8 bg-[#111111] border-2 border-primary rounded-full flex items-center justify-center shadow-lg text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 hover:bg-[#1A1A1A] z-10"
                                    title="Edit Match Score"
                                  >
                                    <Settings className="w-4 h-4" />
                                  </Link>
                                )}

                                {isEditingThis ? (
                                  <form action={updateMatchScore} className="p-3 bg-[#111111] border border-primary/50 rounded-xl space-y-3 z-20 relative shadow-2xl shadow-primary/20">
                                    <input type="hidden" name="matchId" value={m.id} />
                                    <input type="hidden" name="tournamentId" value={tournament.id} />
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-xs font-bold text-gray-300 w-24 truncate">{name1}</span>
                                      <input type="number" name="score1" defaultValue={m.score1} className="w-14 bg-black border border-white/20 rounded px-2 py-1 text-sm text-center text-white focus:border-primary outline-none" />
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-xs font-bold text-gray-300 w-24 truncate">{name2}</span>
                                      <input type="number" name="score2" defaultValue={m.score2} className="w-14 bg-black border border-white/20 rounded px-2 py-1 text-sm text-center text-white focus:border-primary outline-none" />
                                    </div>
                                    <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                                      <select name="winnerId" defaultValue={m.winnerId || ""} className="w-full bg-black border border-white/20 rounded px-2 py-1.5 text-xs text-white focus:border-primary outline-none">
                                        <option value="">-- Set Winner (TBA) --</option>
                                        {p1 && <option value={p1.id}>{name1}</option>}
                                        {p2 && <option value={p2.id}>{name2}</option>}
                                      </select>
                                      <div className="flex gap-2">
                                        <Link href={`/tournaments/${tournament.id}?tab=bracket`} className="flex-1 text-center py-1.5 bg-white/10 text-xs font-bold rounded hover:bg-white/20 transition-colors">Cancel</Link>
                                        <button type="submit" className="flex-1 py-1.5 bg-primary text-black font-black text-xs rounded hover:bg-primary/90 transition-colors">Save</button>
                                      </div>
                                    </div>
                                  </form>
                                ) : (
                                  <div className="p-4">
                                    {/* P1 Node */}
                                    <div className={`flex items-center justify-between p-2 rounded-lg mb-1 transition-colors ${isP1Winner ? 'bg-primary/10 shadow-[inset_0_0_15px_rgba(250,204,21,0.1)] border border-primary/30' : 'hover:bg-white/5'}`}>
                                      <div className="flex items-center gap-3 w-[70%]">
                                        <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-gray-400 overflow-hidden shrink-0 border border-white/5">
                                          {p1?.user?.image ? <img src={p1.user.image} className="w-full h-full object-cover" /> : name1.charAt(0)}
                                        </div>
                                        <span className={`text-sm font-bold truncate ${isP1Winner ? 'text-primary' : 'text-gray-200'}`}>{name1}</span>
                                      </div>
                                      <span className={`text-sm font-black ${isP1Winner ? 'text-primary' : 'text-gray-500'}`}>{m.score1}</span>
                                    </div>

                                    {/* Splitter */}
                                    <div className="h-px w-full bg-white/10 my-1" />

                                    {/* P2 Node */}
                                    <div className={`flex items-center justify-between p-2 rounded-lg transition-colors ${isP2Winner ? 'bg-primary/10 shadow-[inset_0_0_15px_rgba(250,204,21,0.1)] border border-primary/30' : 'hover:bg-white/5'}`}>
                                      <div className="flex items-center gap-3 w-[70%]">
                                        <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-gray-400 overflow-hidden shrink-0 border border-white/5">
                                          {p2?.user?.image ? <img src={p2.user.image} className="w-full h-full object-cover" /> : name2.charAt(0)}
                                        </div>
                                        <span className={`text-sm font-bold truncate ${isP2Winner ? 'text-primary' : 'text-gray-200'}`}>{name2}</span>
                                      </div>
                                      <span className={`text-sm font-black ${isP2Winner ? 'text-primary' : 'text-gray-500'}`}>{m.score2}</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* CSS Bracketing Connectors */}
                              {!isFinal && (
                                <>
                                  <div className="absolute top-1/2 -right-8 w-8 h-[2px] bg-primary/40 group-hover:bg-primary transition-colors z-0" />
                                  {m.matchIndex % 2 === 0 ? (
                                    <div className="absolute top-1/2 -right-8 w-[2px] h-[calc(50%+1.5rem)] bg-primary/40 group-hover:bg-primary transition-colors z-0" />
                                  ) : (
                                    <div className="absolute bottom-1/2 -right-8 w-[2px] h-[calc(50%+1.5rem)] bg-primary/40 group-hover:bg-primary transition-colors z-0" />
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </section>
        )}

        {activeTab === "chat" && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="mx-auto max-w-3xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                  Tournament Chat
                </h3>
                {!currentUser && (
                  <Link href="/login" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
                    Sign in to chat
                  </Link>
                )}
              </div>
              <TournamentChat
                tournamentId={tournamentData.id}
                currentUserId={currentUser?.id ?? null}
              />
            </div>
          </section>
        )}

        {activeTab === "prizes" && (() => {
          let prizeData: any = null;
          try {
            if (tournament.prize && (tournament.prize.trim().startsWith("{") || tournament.prize.trim().startsWith("["))) {
              prizeData = JSON.parse(tournament.prize);
            }
          } catch { }

          const getPrizeAmount = (rank: number) => {
            if (prizeData && prizeData.distribution) {
              const p = prizeData.distribution.find((d: any) => d.rank === rank || d.rank === rank.toString());
              return p ? `${Number(p.amount).toFixed(2)} ${prizeData.currency}` : "TBA";
            }
            // Legacy fallback or Unconfigured state
            return "TBA";
          };

          const lowerRanks = prizeData?.distribution?.filter((d: any) => d.rank > 3) || [];

          return (
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-5xl mx-auto pb-20">
              {/* Top Ribbon */}
              <div className="relative flex justify-center mb-16 mt-4">
                <div className="relative z-10 bg-[#111111] px-12 py-4 shadow-2xl skew-x-[-10deg] border border-2 border-primary">
                  <div className="skew-x-[10deg] text-white font-black text-2xl tracking-tight drop-shadow-md">
                    Total Prize Pool: {prizeData ? `${Number(prizeData.total).toFixed(2)} ${prizeData.currency}` : tournament.prize}
                  </div>
                </div>
                {/* Ribbon Tails */}
                <div className="absolute top-2 -left-6 w-16 h-12 bg-primary/20 skew-x-[30deg] z-0" />
                <div className="absolute top-2 -right-6 w-16 h-12 bg-primary/20 skew-x-[-30deg] z-0" />
              </div>

              {/* Podium Grid */}
              <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-6 mb-12 h-[350px]">

                {/* 2nd Place (Silver) */}
                <div className="w-[220px] bg-gradient-to-b from-[#C0C0C0]/90 to-[#808080]/90 rounded-2xl p-6 text-center shadow-[0_10px_40px_-10px_rgba(192,192,192,0.4)] border border-white/40 flex flex-col items-center justify-between h-[280px] hover:-translate-y-2 transition-transform">
                  <div className="flex flex-col items-center gap-2">
                    <Award className="w-10 h-10 text-white drop-shadow-md" />
                    <div className="font-black text-4xl text-white drop-shadow-lg font-serif">2</div>
                  </div>
                  <div className="text-sm font-black text-lime-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] tracking-wider">{getPrizeAmount(2)}</div>
                  <div className="mt-4 flex flex-col items-center gap-2 w-full">
                    <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center font-black text-xl text-white shadow-inner">
                      {participantsList[1] ? participantsList[1].name.charAt(0) : "K"}
                    </div>
                    <div className="text-sm font-black text-white truncate w-full">{participantsList[1] ? participantsList[1].name : "TBD"}</div>
                    <div className="text-[10px] text-white/70 font-mono -mt-1">{participantsList[1] ? participantsList[1].mlbbId || "1474369755" : "-"}</div>
                  </div>
                </div>

                {/* 1st Place (Gold) */}
                <div className="w-[240px] bg-gradient-to-b from-primary/95 to-[#B8860B]/95 rounded-2xl p-6 text-center shadow-[0_15px_50px_-10px_rgba(250,204,21,0.5)] border-2 border-yellow-200/50 flex flex-col items-center justify-between h-[320px] relative z-10 hover:-translate-y-2 transition-transform">
                  <div className="absolute -top-6">
                    <Crown className="w-14 h-14 text-yellow-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                  </div>
                  <div className="flex flex-col items-center gap-2 mt-6">
                    <div className="font-black text-5xl text-white drop-shadow-lg font-serif">1</div>
                  </div>
                  <div className="text-base font-black text-lime-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.9)] tracking-wider">{getPrizeAmount(1)}</div>
                  <div className="mt-4 flex flex-col items-center gap-3 w-full">
                    <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-yellow-100 flex items-center justify-center font-black text-2xl text-white shadow-inner">
                      {participantsList[0] ? participantsList[0].name.charAt(0) : "M"}
                    </div>
                    <div className="text-base font-black text-white truncate w-full">{participantsList[0] ? participantsList[0].name : "TBD"}</div>
                    <div className="text-[10px] text-yellow-900 font-mono font-bold -mt-1">{participantsList[0] ? participantsList[0].mlbbId || "413217402" : "-"}</div>
                  </div>
                </div>

                {/* 3rd Place (Bronze) */}
                <div className="w-[220px] bg-gradient-to-b from-[#CD7F32]/90 to-[#8B4513]/90 rounded-2xl p-6 text-center shadow-[0_10px_40px_-10px_rgba(205,127,50,0.4)] border border-orange-300/30 flex flex-col items-center justify-between h-[260px] hover:-translate-y-2 transition-transform">
                  <div className="flex flex-col items-center gap-2">
                    <Award className="w-8 h-8 text-white drop-shadow-md" />
                    <div className="font-black text-4xl text-white drop-shadow-lg font-serif">3</div>
                  </div>
                  <div className="text-sm font-black text-lime-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] tracking-wider">{getPrizeAmount(3)}</div>
                  <div className="mt-4 flex flex-col items-center gap-2 w-full">
                    <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center font-black text-xl text-white shadow-inner">
                      {participantsList[2] ? participantsList[2].name.charAt(0) : "T"}
                    </div>
                    <div className="text-sm font-black text-white truncate w-full">{participantsList[2] ? participantsList[2].name : "TBD"}</div>
                    <div className="text-[10px] text-white/70 font-mono -mt-1">{participantsList[2] ? participantsList[2].mlbbId || "-" : "-"}</div>
                  </div>
                </div>

              </div>

              {/* Lower Ranks List */}
              {lowerRanks.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-[#1a1a1a]/80 backdrop-blur-xl overflow-hidden shadow-2xl">
                  <div className="grid grid-cols-[100px_1fr_150px] px-8 py-5 text-xs font-bold text-green-400 border-b border-white/5 uppercase tracking-widest bg-white/[0.02]">
                    <span>Rank</span>
                    <span>User Name</span>
                    <span className="text-right">Prize</span>
                  </div>
                  {lowerRanks.map((rankData: any) => {
                    const p = participantsList[rankData.rank - 1]; // 0 indexed
                    return (
                      <div key={rankData.rank} className="grid grid-cols-[100px_1fr_150px] px-8 py-5 items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full border border-green-500/30 flex items-center justify-center font-black text-lime-500 text-sm bg-green-500/10">
                            {rankData.rank}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-green-500/10 text-lime-400 font-bold flex items-center justify-center text-xs">
                            {p ? p.name.charAt(0) : "T"}
                          </div>
                          <span className="font-bold text-gray-200 text-sm tracking-wide">{p ? p.name : "TBD"}</span>
                        </div>
                        <div className="text-sm font-black text-lime-400 text-right tracking-wider">
                          {Number(rankData.amount).toFixed(2)} {prizeData.currency}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })()}

        {activeTab === "participants" && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              {participantsList.map((participant, index) => (
                <ParticipantCard
                  key={participant.id}
                  participant={participant}
                  index={index}
                />
              ))}
            </div>
          </section>
        )}

        {activeTab === "rules" && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-4xl">
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Tournament Rules</h2>
              <p className="text-xs text-gray-400 font-medium tracking-wide">Here are the rules and regulations for this tournament.</p>
            </div>

            <div className="space-y-10">
              <div>
                <h3 className="text-3xl font-black text-white mb-8 tracking-tight">{tournament.title}</h3>
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">GENERAL FORMAT</h4>
                  <ul className="space-y-3 text-sm text-gray-300 font-medium list-disc pl-5 marker:text-primary">
                    <li><span className="text-white">Team Size:</span> {tournament.mode}</li>
                    <li><span className="text-white">Battlefield:</span> {tournament.battlefield}</li>
                    <li><span className="text-white">Tournament Format:</span> {tournament.bracketType}</li>
                    <li><span className="text-white">Stages:</span> {tournament.stages}</li>
                    <li><span className="text-white">Match Type:</span> Best of 1</li>
                    <li><span className="text-white">MLBB Match Mode:</span> {tournament.matchMode}</li>
                  </ul>
                </div>
              </div>

              <div>
                <div className="space-y-4 mt-12">
                  <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">START TIME</h4>
                  <ul className="space-y-3 text-sm text-gray-300 font-medium list-disc pl-5 marker:text-primary">
                    <li><span className="text-white">Local Time:</span> {tournament.startDate}</li>
                    <li><span className="text-white">Maximum Capacity:</span> {tournament.maxParticipants} slots</li>
                    <li><span className="text-white">Registration Status:</span> {registrationIsOpen ? "Open globally" : "Registration locked"}</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function TabLink({ children, active, href }: {
  children: React.ReactNode;
  active?: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`py-5 text-xs tracking-widest font-black transition-all relative whitespace-nowrap uppercase ${active ? 'text-primary' : 'text-gray-400 hover:text-white'
        }`}
    >
      {children}
      {active && (
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
      )}
    </Link>
  )
}

function TimelineStep({ status, label, state }: { status: string; label: string; state: 'completed' | 'active' | 'pending' }) {
  const dotColor =
    state === 'completed' ? 'bg-primary shadow-[0_0_10px_rgba(250,204,21,0.5)]' :
      state === 'active' ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-gray-800 border border-white/10';

  const textColor =
    state === 'completed' ? 'text-gray-300' :
      state === 'active' ? 'text-white' : 'text-gray-600';

  return (
    <div className="relative pl-8 py-4">
      <div className={`absolute left-[-2px] top-5 w-2.5 h-2.5 rounded-full ${dotColor} transition-colors z-10`} />
      <div className={`text-sm font-black uppercase tracking-widest leading-tight ${textColor}`}>{status}</div>
      <div className="text-xs text-gray-500 font-medium mt-1">{label}</div>
    </div>
  );
}

function ParticipantCard({ participant, index }: { participant: { id: string; name: string; avatar: string; status: string; joinedAt: Date; mlbbId: string; inGameName: string }; index: number }) {
  const topColors = [
    "from-orange-600/60 to-orange-900/40",
    "from-green-600/60 to-emerald-900/40",
    "from-yellow-600/60 to-amber-900/40",
    "from-blue-600/60 to-cyan-900/40",
    "from-purple-600/60 to-fuchsia-900/40",
  ];

  return (
    <div className="rounded-2xl border border-white/5 overflow-hidden bg-[#1A1A1A] hover:border-primary/50 hover:shadow-[0_0_20px_rgba(250,204,21,0.1)] transition-all shadow-lg flex flex-col group">
      <div className={`h-16 bg-gradient-to-br ${topColors[index % topColors.length]} opacity-90`} />
      <div className="px-5 pb-5 -mt-8 text-center relative z-10 flex-1 flex flex-col">
        <div className="mx-auto w-16 h-16 rounded-full bg-[#111111] border-4 border-[#1A1A1A] overflow-hidden flex items-center justify-center font-bold text-white text-xl shadow-md transition-transform group-hover:scale-105">
          {participant.avatar ? (
            <img src={participant.avatar} alt={participant.name} className="w-full h-full object-cover" />
          ) : (
            participant.name.charAt(0)
          )}
        </div>
        <div className="mt-3 text-sm font-bold text-white tracking-wide truncate px-2">{participant.name}</div>
        <div className="text-[10px] text-gray-500 font-medium mt-1">{new Date(participant.joinedAt).toLocaleDateString()}</div>

        <div className="mt-auto pt-5">
          <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-2 text-center">
            <div>
              <div className="text-[11px] font-black text-white truncate">{participant.mlbbId}</div>
              <div className="text-[8px] uppercase tracking-widest text-gray-500 mt-1">IN-GAME ID</div>
            </div>
            <div>
              <div className="text-[11px] font-black text-white truncate">{participant.inGameName}</div>
              <div className="text-[8px] uppercase tracking-widest text-gray-500 mt-1">IN-GAME NAME</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
