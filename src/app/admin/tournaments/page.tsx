import Link from "next/link";
import { Eye, Pencil, Plus, Search, Trash2, Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PageHero, PageShell, SurfaceCard } from "@/components/ui/PageShell";
import { getGameModeLabel } from "@/lib/tournament-config";

export default async function AdminTournamentsPage() {
  const tournaments = await prisma.tournament.findMany({
    include: {
      _count: {
        select: { participants: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  async function deleteTournament(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await prisma.tournament.delete({ where: { id } });
    revalidatePath("/admin/tournaments");
  }

  return (
    <PageShell size="wide" tone="danger">
      <PageHero
        eyebrow="Tournament Ops"
        icon={<Trophy className="h-4 w-4" />}
        title="Manage tournament operations"
        description="Review all active and historical tournaments, then jump into create, edit, or deletion flows from one brighter admin panel."
        stats={[
          { label: "Total", value: tournaments.length },
          { label: "Live", value: tournaments.filter((t) => t.status === "ONGOING").length },
          { label: "Open", value: tournaments.filter((t) => t.status === "REGISTRATION_OPEN").length },
        ]}
        actions={
          <Link href="/admin/tournaments/create" className="action-button-primary text-[11px]">
            <Plus className="h-4 w-4" />
            Create New
          </Link>
        }
      />

      <SurfaceCard className="p-0">
        <div className="border-b border-border p-5">
          <div className="flex items-center gap-3 rounded-[1.4rem] border border-border bg-muted/40 px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tournaments..."
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        <div className="custom-scrollbar overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                {["Tournament", "Mode", "Status", "Participants", "Actions"].map((heading) => (
                  <th key={heading} className="px-6 py-4 text-[0.62rem] font-black uppercase tracking-[0.24em] text-muted-foreground">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tournaments.map((tournament) => (
                <tr key={tournament.id} className="border-b border-border transition-colors hover:bg-muted">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-muted text-primary">
                        <Trophy className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-display text-xl font-black uppercase tracking-[0.08em] text-foreground">{tournament.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground">Created {new Date(tournament.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-muted-foreground">{getGameModeLabel(tournament.gameMode)}</td>
                  <td className="px-6 py-5">
                    <span className="rounded-full border border-border bg-muted px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.22em] text-primary">
                      {tournament.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-muted-foreground">
                    {tournament._count.participants}/{tournament.maxTeams}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Link href={`/tournaments/${tournament.id}`} className="rounded-xl border border-border bg-muted p-2 text-muted-foreground transition-colors hover:text-primary">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link href={`/admin/tournaments/${tournament.id}/edit`} className="rounded-xl border border-border bg-muted p-2 text-muted-foreground transition-colors hover:text-white">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <form action={deleteTournament}>
                        <input type="hidden" name="id" value={tournament.id} />
                        <button type="submit" className="rounded-xl border border-border bg-muted p-2 text-muted-foreground transition-colors hover:text-rose-300">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </PageShell>
  );
}
