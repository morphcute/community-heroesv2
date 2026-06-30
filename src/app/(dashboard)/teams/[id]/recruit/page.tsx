import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PageHero, PageShell, SurfaceCard } from "@/components/ui/PageShell";
import { Users, Search, Target, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import RoleDisplay from "@/components/RoleDisplay";
import { inviteMember } from "../../actions";
import { notFound, redirect } from "next/navigation";

export default async function TeamRecruitPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const session = await auth();

  if (!session?.user?.email) redirect("/login");

  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      captain: true,
      members: true,
    },
  });

  if (!team) notFound();

  // Verify the current user is the captain
  if (team.captain.email !== session.user.email) {
    return (
      <PageShell>
        <SurfaceCard tone="danger">
          <div className="text-center p-8">
            <Shield className="mx-auto h-12 w-12 text-rose-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-slate-400">Only the team captain can access recruitment tools.</p>
            <Link href={`/teams/${id}`} className="mt-6 inline-block action-button-secondary">Return to Team</Link>
          </div>
        </SurfaceCard>
      </PageShell>
    );
  }

  // Parse search params
  const strQuery = typeof resolvedSearchParams?.q === 'string' ? resolvedSearchParams.q : '';
  const page = typeof resolvedSearchParams?.page === 'string' ? parseInt(resolvedSearchParams.page, 10) || 1 : 1;
  const pageSize = 12;

  const whereClause = {
    teamMembers: {
      none: { status: "APPROVED" as const }
    },
    ...(strQuery ? { name: { contains: strQuery, mode: "insensitive" as const } } : {})
  };

  const totalFreeAgents = await prisma.user.count({ where: whereClause });
  const totalPages = Math.ceil(totalFreeAgents / pageSize);

  const freeAgents = await prisma.user.findMany({
    where: whereClause,
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <PageShell size="wide" tone="gold">
      <Link href={`/teams/${id}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors mb-4">
        <ChevronLeft className="h-4 w-4" /> Back to {team.name}
      </Link>

      <PageHero
        eyebrow="Recruitment"
        icon={<Target className="h-4 w-4" />}
        title={
          <>
            Scout
            <span className="text-gradient-primary"> Free Agents</span>
          </>
        }
        description="Find unassigned players to fill your team's roster."
        stats={[
          { label: "Total Available", value: totalFreeAgents },
          { label: "Open Slots", value: 5 - team.members.filter((m) => m.status === 'APPROVED').length }
        ]}
      />

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <form method="GET" action={`/teams/${id}/recruit`} className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            name="q"
            defaultValue={strQuery}
            placeholder="Search players by name..."
            className="w-full rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,31,0.96),rgba(8,11,25,0.86))] py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 shadow-xl outline-none transition-colors focus:border-primary/50"
          />
        </form>
        <div className="text-sm font-medium text-slate-400">
          Showing page {page} of {Math.max(1, totalPages)}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {freeAgents.length === 0 ? (
          <SurfaceCard className="sm:col-span-2 lg:col-span-3 xl:col-span-4 text-center py-16">
             <Search className="mx-auto h-12 w-12 text-slate-500 mb-4" />
             <h3 className="text-xl font-bold text-white mb-2">No Free Agents Found</h3>
             <p className="text-slate-400">Try adjusting your search criteria or check back later.</p>
          </SurfaceCard>
        ) : (
          freeAgents.map((agent) => {
            const hasPendingInvite = team.members.some(
              (m) => m.userId === agent.id && m.status === "INVITED"
            );

            return (
              <SurfaceCard key={agent.id} className="flex flex-col !p-4 sm:!p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-white/10 flex items-center justify-center font-bold text-slate-300 border border-white/10">
                    {agent.image ? (
                      <img src={agent.image} alt={agent.name || "Player"} className="h-full w-full object-cover" />
                    ) : (
                      (agent.name || "U")[0]
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-white text-base leading-tight">{agent.name || "Unknown Player"}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">{agent.rank || "Unranked"}</p>
                  </div>
                </div>

                <div className="flex-1 mb-5">
                   <div className="flex flex-wrap gap-1">
                     {agent.roles && Array.isArray(agent.roles) && agent.roles.length > 0 ? (
                        <RoleDisplay roles={agent.roles as string[]} />
                     ) : (
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-1 rounded-md">No roles set</span>
                     )}
                   </div>
                </div>

                <div className="mt-auto pt-4 border-t border-white/5">
                  {hasPendingInvite ? (
                    <button disabled className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-[11px] font-bold tracking-wide uppercase text-slate-400 cursor-not-allowed">
                      Invite Pending
                    </button>
                  ) : (
                    <form action={inviteMember}>
                      <input type="hidden" name="teamId" value={team.id} />
                      <input type="hidden" name="userId" value={agent.id} />
                      <button className="w-full rounded-xl bg-primary/90 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-black transition-all shadow-lg shadow-primary/20 hover:bg-primary btn-animate">
                        Recruit Player
                      </button>
                    </form>
                  )}
                </div>
              </SurfaceCard>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href={`?q=${strQuery}&page=${Math.max(1, page - 1)}`}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,31,0.96),rgba(8,11,25,0.86))] transition-colors ${page <= 1 ? "pointer-events-none opacity-50" : "hover:border-primary/30 hover:text-white text-slate-400"}`}
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Simple pagination logic focusing on current page
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (page <= 3) pageNum = i + 1;
              else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = page - 2 + i;

              return (
                <Link
                  key={pageNum}
                  href={`?q=${strQuery}&page=${pageNum}`}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold transition-colors ${pageNum === page ? "border-primary/50 bg-primary/10 text-primary" : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white"}`}
                >
                  {pageNum}
                </Link>
              );
            })}
          </div>
          <Link
            href={`?q=${strQuery}&page=${Math.min(totalPages, page + 1)}`}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,31,0.96),rgba(8,11,25,0.86))] transition-colors ${page >= totalPages ? "pointer-events-none opacity-50" : "hover:border-primary/30 hover:text-white text-slate-400"}`}
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      )}
    </PageShell>
  );
}
