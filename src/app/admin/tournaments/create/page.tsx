import { Calendar, Gamepad2, Settings, Swords, Trophy } from "lucide-react";
import Link from "next/link";
import { GameMode, TournamentFormat, TournamentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { PrizeDistribution } from "./PrizeDistribution";
import RegionSelect from "@/components/ui/RegionSelect";
import { PageHero, PageShell, SurfaceCard } from "@/components/ui/PageShell";
import AppSelect from "@/components/ui/AppSelect";
import {
  BATTLEFIELD_OPTIONS,
  GAME_MODE_OPTIONS,
  MATCH_MODE_SUGGESTIONS,
  STAGE_TYPE_OPTIONS,
  TOURNAMENT_FORMAT_OPTIONS,
} from "@/lib/tournament-config";

type SessionUserWithRole = {
  role?: string;
};

export default async function CreateTournamentPage() {
  const session = await auth();
  const role = (session?.user as SessionUserWithRole | undefined)?.role;
  if (role !== "SUPERADMIN" && role !== "MODERATOR") {
    redirect("/home");
  }

  async function createTournament(formData: FormData) {
    "use server";
    const userRole = ((await auth())?.user as SessionUserWithRole | undefined)?.role;
    if (userRole !== "SUPERADMIN" && userRole !== "MODERATOR") return;

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const banner = formData.get("banner") as string;
    const gameMode = formData.get("gameMode") as GameMode;
    const matchMode = formData.get("matchMode") as string;
    const battlefield = formData.get("battlefield") as "ONLINE" | "ONSITE";
    const stageType = formData.get("stageType") as "SINGLE_STAGE" | "MULTIPLE_STAGES";
    const stageCountInput = parseInt(formData.get("stageCount") as string, 10);
    const format = formData.get("format") as TournamentFormat;
    const maxTeams = parseInt(formData.get("maxTeams") as string, 10);
    const prizePool = formData.get("prizePool") as string;
    const entryFee = formData.get("entryFee") as string;
    const locationRestriction = formData.get("locationRestriction") as string;
    const startDate = new Date(formData.get("startDate") as string);

    const activeSession = await auth();
    if (!activeSession?.user?.email) return;

    const author = await prisma.user.findUnique({ where: { email: activeSession.user.email } });
    if (!author) return;

    const newTournament = await prisma.tournament.create({
      data: {
        title,
        description,
        banner,
        gameMode,
        matchMode: matchMode || "Draft Pick",
        battlefield,
        stageType,
        stageCount: stageType === "MULTIPLE_STAGES" ? Math.max(2, stageCountInput || 2) : 1,
        platform: "Mobile",
        format,
        locationRestriction: locationRestriction || null,
        maxTeams,
        prizePool,
        entryFee,
        startDate,
        status: TournamentStatus.REGISTRATION_OPEN,
      },
    });

    await prisma.tournamentAdmin.create({
      data: {
        tournamentId: newTournament.id,
        userId: author.id,
        role: "ADMIN",
      },
    });

    revalidatePath("/admin");
    revalidatePath("/tournaments");
    redirect("/admin");
  }

  return (
    <PageShell size="wide" tone="danger">
      <PageHero
        eyebrow="Tournament Forge"
        icon={<Trophy className="h-4 w-4" />}
        title="Create a new tournament"
        description="Configure format, region gate, prize structure, and launch timing from the refreshed admin flow."
      />

      <form action={createTournament} className="space-y-6">
        <SurfaceCard>
          <div className="mb-6 flex items-center gap-3">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-black uppercase tracking-[0.08em] text-white">General Details</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input required name="title" type="text" placeholder="Tournament title" className="input-hud" />
            <input name="banner" type="url" placeholder="Banner URL (optional)" className="input-hud" />
            <textarea required name="description" rows={5} placeholder="Description, rules, and structure..." className="input-hud resize-none md:col-span-2" />
          </div>
        </SurfaceCard>

        <SurfaceCard tone="gold">
          <div className="mb-6 flex items-center gap-3">
            <Gamepad2 className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-black uppercase tracking-[0.08em] text-white">Game Rules</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AppSelect
              name="gameMode"
              defaultValue="TEAM_5V5"
              placeholder="Select team size"
              options={GAME_MODE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
            />
            <input
              required
              name="matchMode"
              type="text"
              list="mlbb-match-modes"
              placeholder="Draft Pick"
              defaultValue="Draft Pick"
              className="input-hud"
            />
            <datalist id="mlbb-match-modes">
              {MATCH_MODE_SUGGESTIONS.map((mode) => (
                <option key={mode} value={mode} />
              ))}
            </datalist>
            <AppSelect
              name="battlefield"
              defaultValue="ONLINE"
              placeholder="Select battlefield"
              options={BATTLEFIELD_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
            />
            <AppSelect
              name="format"
              defaultValue="SINGLE_ELIMINATION"
              placeholder="Select bracket format"
              options={TOURNAMENT_FORMAT_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
            />
            <AppSelect
              name="stageType"
              defaultValue="SINGLE_STAGE"
              placeholder="Select stage setup"
              options={STAGE_TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
            />
            <input name="stageCount" type="number" min="1" max="99" defaultValue="1" className="input-hud" />
            <div className="md:col-span-2 lg:col-span-3">
              <RegionSelect fieldName="locationRestriction" defaultValue="" />
              <p className="mt-2 text-xs text-slate-500">Leave empty for nationwide eligibility, or set a specific regional gate.</p>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard tone="gold">
          <div className="mb-6 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-black uppercase tracking-[0.08em] text-white">Logistics & Prizes</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <input required name="maxTeams" type="number" min="2" max="512" defaultValue="64" className="input-hud" />
            <input required name="startDate" type="datetime-local" className="input-hud" />
            <input required name="entryFee" type="text" defaultValue="Free" className="input-hud" />
          </div>
          <div className="mt-6">
            <PrizeDistribution />
          </div>
        </SurfaceCard>

        <div className="flex justify-end gap-3">
          <Link href="/admin/tournaments" className="action-button-secondary text-[11px]">
            Cancel
          </Link>
          <button type="submit" className="action-button-primary text-[11px]">
            <Swords className="h-4 w-4" />
            Launch Tournament
          </button>
        </div>
      </form>
    </PageShell>
  );
}
