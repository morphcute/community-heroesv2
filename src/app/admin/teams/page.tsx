import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Shield, Users } from "lucide-react";
import { PageHero, PageShell, SurfaceCard } from "@/components/ui/PageShell";
import { DeleteButton } from "../components/DeleteButton";

type SessionUserWithRole = {
  role?: string;
};

export default async function AdminTeamsPage() {
  const session = await auth();
  const role = (session?.user as SessionUserWithRole | undefined)?.role;
  if (role !== "SUPERADMIN" && role !== "MODERATOR") {
    redirect("/home");
  }

  const teams = await prisma.team.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      captain: true,
      _count: {
        select: { members: true },
      },
    },
  });

  async function deleteTeam(id: string) {
    "use server";
    const session = await auth();
    const role = (session?.user as SessionUserWithRole | undefined)?.role;
    if (role !== "SUPERADMIN" && role !== "MODERATOR") return;

    if (!id) return;

    await prisma.$transaction([
      prisma.teamMember.deleteMany({ where: { teamId: id } }),
      prisma.message.deleteMany({ where: { teamId: id } }),
      prisma.scrim.deleteMany({ where: { OR: [{ hostTeamId: id }, { guestTeamId: id }] } }),
      prisma.tournamentParticipant.deleteMany({ where: { teamId: id } }),
      prisma.team.delete({ where: { id } }),
    ]);

    revalidatePath("/admin/teams");
  }

  return (
    <PageShell size="wide" tone="danger">
      <PageHero
        eyebrow="Operations Hub"
        icon={<Users className="h-4 w-4" />}
        title="Manage Team Lineups"
        description="Monitor registered teams, check active roster counts, and disband squads when necessary."
        stats={[
          { label: "Total Teams", value: teams.length },
          { label: "Active Captains", value: teams.filter((t) => t.captainId).length },
        ]}
      />

      <SurfaceCard className="p-0">
        <div className="custom-scrollbar overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                {["Team Info", "Captain", "Roster Size", "Created At", "Actions"].map((heading) => (
                  <th key={heading} className="px-6 py-4 text-[0.62rem] font-black uppercase tracking-[0.24em] text-muted-foreground">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    No teams have been created yet.
                  </td>
                </tr>
              ) : (
                teams.map((team) => (
                  <tr key={team.id} className="border-b border-border transition-colors hover:bg-muted">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted text-primary">
                          {team.logo ? (
                            <img src={team.logo} alt={team.name} className="h-full w-full object-cover" />
                          ) : (
                            <Shield className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="font-display text-xl font-black uppercase tracking-[0.08em] text-foreground">{team.name}</div>
                          <div className="mt-1 text-[10px] font-mono text-muted-foreground">{team.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-foreground">
                      {team.captain.name || team.captain.email}
                    </td>
                    <td className="px-6 py-5 text-sm text-muted-foreground">
                      {team._count.members} / 5
                    </td>
                    <td className="px-6 py-5 text-sm text-muted-foreground">
                      {new Date(team.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5">
                      <DeleteButton id={team.id} action={deleteTeam} confirmMessage="Are you sure you want to delete this team?" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </PageShell>
  );
}
