import { Sparkles, Shield } from "lucide-react";
import { createTeam } from "../actions";
import { PageHero, PageShell, SurfaceCard } from "@/components/ui/PageShell";

export default function CreateTeamPage() {
  return (
    <PageShell tone="blue">
      <PageHero
        eyebrow="Create Squad"
        icon={<Shield className="h-4 w-4" />}
        title={
          <>
            Launch a
            <span className="text-gradient-electric"> new roster</span>
          </>
        }
        description="Name your squad, set the tone, and give future teammates a cleaner first impression."
      />

      <SurfaceCard className="mx-auto w-full max-w-2xl">
        <form action={createTeam} className="relative z-10 space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-slate-400">
              Team Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className="input-hud"
              placeholder="e.g. Aurora Five, Rift Pulse"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-slate-400">
              Team Identity
            </label>
            <textarea
              name="description"
              id="description"
              rows={5}
              className="input-hud resize-none"
              placeholder="Describe your playstyle, goals, or the type of players you want to recruit."
            />
          </div>

          <button type="submit" className="action-button-primary w-full justify-center text-[11px]">
            <Sparkles className="h-4 w-4" />
            Create Team
          </button>
        </form>
      </SurfaceCard>
    </PageShell>
  );
}
