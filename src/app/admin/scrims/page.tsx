import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Swords } from "lucide-react";
import { PageHero, PageShell, SurfaceCard } from "@/components/ui/PageShell";
import { DeleteButton } from "../components/DeleteButton";

type SessionUserWithRole = {
  role?: string;
};

export default async function AdminScrimsPage() {
  const session = await auth();
  const role = (session?.user as SessionUserWithRole | undefined)?.role;
  if (role !== "SUPERADMIN" && role !== "MODERATOR") {
    redirect("/home");
  }

  const scrims = await prisma.scrim.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      hostTeam: true,
      guestTeam: true,
      hostedBy: true,
    },
  });

  async function deleteScrim(id: string) {
    "use server";
    const session = await auth();
    const role = (session?.user as SessionUserWithRole | undefined)?.role;
    if (role !== "SUPERADMIN" && role !== "MODERATOR") return;

    if (!id) return;

    await prisma.scrim.delete({ where: { id } });
    revalidatePath("/admin/scrims");
  }

  return (
    <PageShell size="wide" tone="danger">
      <PageHero
        eyebrow="Operations Hub"
        icon={<Swords className="h-4 w-4" />}
        title="Manage Scrimmage Matches"
        description="Monitor community-organized scrims, track match statuses, and remove scrim slots if needed."
        stats={[
          { label: "Total Scrims", value: scrims.length },
          { label: "Open Slots", value: scrims.filter((s) => s.status === "OPEN").length },
          { label: "Completed", value: scrims.filter((s) => s.status === "COMPLETED").length },
        ]}
      />

      <SurfaceCard className="p-0">
        <div className="custom-scrollbar overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                {["Host Team", "Guest Team", "Status", "Scheduled At", "Actions"].map((heading) => (
                  <th key={heading} className="px-6 py-4 text-[0.62rem] font-black uppercase tracking-[0.24em] text-muted-foreground">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scrims.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    No scrims have been created yet.
                  </td>
                </tr>
              ) : (
                scrims.map((scrim) => (
                  <tr key={scrim.id} className="border-b border-border transition-colors hover:bg-muted">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="font-display text-xl font-black uppercase tracking-[0.08em] text-foreground">
                          {scrim.hostTeam.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-foreground">
                      {scrim.guestTeam?.name || <span className="text-muted-foreground italic">Pending Guest...</span>}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`rounded-full border px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.22em] ${
                        scrim.status === "COMPLETED"
                          ? "bg-green-500/10 border-green-500/25 text-green-400"
                          : scrim.status === "ACCEPTED"
                          ? "bg-blue-500/10 border-blue-500/25 text-blue-400"
                          : "bg-amber-500/10 border-amber-500/25 text-amber-400"
                      }`}>
                        {scrim.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-muted-foreground">
                      {scrim.scheduledAt ? new Date(scrim.scheduledAt).toLocaleString() : "TBA"}
                    </td>
                    <td className="px-6 py-5">
                      <DeleteButton id={scrim.id} action={deleteScrim} confirmMessage="Are you sure you want to delete this scrim?" />
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
