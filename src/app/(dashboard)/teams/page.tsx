import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, Shield, Trophy, Users } from "lucide-react";
import { EmptyState, PageHero, PageShell } from "@/components/ui/PageShell";

export default async function TeamsPage() {
  const teams = await prisma.team.findMany({
    include: {
      members: {
        where: { status: "APPROVED" },
      },
      captain: {
        select: {
          rank: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <PageShell size="wide" tone="gold">
      <PageHero
        eyebrow="Team Directory"
        icon={<Users className="h-4 w-4" />}
        title={
          <>
            Find your
            <span className="text-gradient-primary"> next team</span>
          </>
        }
        description="Browse active teams, check captains, and join a lineup that fits your role and rank."
        stats={[
          { label: "Teams", value: teams.length },
          { label: "Open Slots", value: teams.reduce((sum, team) => sum + Math.max(0, 5 - team.members.length), 0) },
          { label: "Capacity", value: "5 stack" },
        ]}
        actions={
          <Link href="/teams/create" className="action-button-primary text-[11px]">
            Create Team
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      {teams.length === 0 ? (
        <EmptyState
          icon={<Shield className="h-8 w-8" />}
          title="No teams yet"
          description="No teams have been created yet. Start one and open the first lineup for the community."
          action={<Link href="/teams/create" className="action-button-primary text-[11px]">Create team</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="group esports-card p-5 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.16),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(250,204,21,0.14),transparent_20%)] opacity-85" />
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[1.5rem] border border-border bg-muted text-primary">
                      {team.logo ? (
                        <img src={team.logo} alt={team.name} className="h-full w-full object-cover" />
                      ) : (
                        <Shield className="h-7 w-7" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-black uppercase tracking-[0.08em] text-foreground group-hover:text-primary transition-colors">
                        {team.name}
                      </h2>
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Trophy className="h-4 w-4 text-primary" />
                        Captain rank {team.captain.rank || "Unranked"}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <TeamMetric label="Members" value={`${team.members.length}/5`} />
                  <TeamMetric label="Status" value="Active" />
                  <TeamMetric label="Slots" value={Math.max(0, 5 - team.members.length)} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}

function TeamMetric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-muted px-4 py-4 text-center">
      <div className="text-[0.58rem] font-black uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
      <div className="mt-3 font-display text-2xl font-black uppercase tracking-[0.08em] text-foreground">{value}</div>
    </div>
  );
}
