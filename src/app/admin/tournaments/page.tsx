import Link from "next/link";
import { Eye, Pencil, Plus, Search, Trash2, Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PageHero, PageShell, SurfaceCard } from "@/components/ui/PageShell";

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
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search tournaments..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="custom-scrollbar overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left">
                {["Tournament", "Mode", "Status", "Participants", "Actions"].map((heading) => (
                  <th key={heading} className="px-6 py-4 text-[0.62rem] font-black uppercase tracking-[0.24em] text-slate-500">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tournaments.map((tournament) => (
                <tr key={tournament.id} className="border-b border-white/8 transition-colors hover:bg-white/[0.03]">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-primary">
                        <Trophy className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-display text-xl font-black uppercase tracking-[0.08em] text-white">{tournament.title}</div>
                        <div className="mt-1 text-xs text-slate-500">Created {new Date(tournament.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-300">{tournament.gameMode.replaceAll("_", " ")}</td>
                  <td className="px-6 py-5">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.22em] text-primary">
                      {tournament.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-300">
                    {tournament._count.participants}/{tournament.maxTeams}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Link href={`/tournaments/${tournament.id}`} className="rounded-xl border border-white/10 bg-white/6 p-2 text-slate-300 transition-colors hover:text-cyan-300">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link href={`/admin/tournaments/${tournament.id}/edit`} className="rounded-xl border border-white/10 bg-white/6 p-2 text-slate-300 transition-colors hover:text-white">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <form action={deleteTournament}>
                        <input type="hidden" name="id" value={tournament.id} />
                        <button type="submit" className="rounded-xl border border-white/10 bg-white/6 p-2 text-slate-300 transition-colors hover:text-rose-300">
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
