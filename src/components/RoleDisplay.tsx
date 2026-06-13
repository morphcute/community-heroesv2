"use client";
import { useState } from "react";
import { Shield, Sword, Axe, Zap, Crosshair, ChevronDown, PencilLine } from "lucide-react";
import RoleSelectionForm from "@/app/(dashboard)/teams/my-team/RoleSelectionForm";

const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  TANK_SUPPORT: Shield,
  FIGHTER: Sword,
  JUNGLER: Axe,
  MAGE: Zap,
  MARKSMAN: Crosshair,
};

const roleMeta: Record<string, { label: string; subtitle: string; tone: string }> = {
  TANK_SUPPORT: {
    label: "Roamer",
    subtitle: "Vision and peel",
    tone: "border-emerald-300/18 bg-emerald-300/10 text-emerald-200",
  },
  FIGHTER: {
    label: "EXP Lane",
    subtitle: "Frontline damage",
    tone: "border-orange-300/18 bg-orange-300/10 text-orange-200",
  },
  JUNGLER: {
    label: "Jungle",
    subtitle: "Objectives and tempo",
    tone: "border-violet-300/18 bg-violet-300/10 text-violet-200",
  },
  MAGE: {
    label: "Mid Lane",
    subtitle: "Burst and control",
    tone: "border-sky-300/18 bg-sky-300/10 text-sky-200",
  },
  MARKSMAN: {
    label: "Gold Lane",
    subtitle: "Late-game damage",
    tone: "border-amber-300/18 bg-amber-300/10 text-amber-100",
  },
};

export default function RoleDisplay({ roles }: { roles: string[] }) {
  const [showEdit, setShowEdit] = useState(false);

  return (
    <div className="hud-panel mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[0.58rem] font-black uppercase tracking-[0.2em] text-slate-500">
            Selected Lanes
          </div>
          <h3 className="mt-2 font-display text-xl font-black uppercase tracking-[0.06em] text-white">
            Your comfort picks
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Show teammates where you perform best before queue or tournament registration.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.16em] text-primary transition-all hover:border-primary/35 hover:bg-primary/14"
          onClick={() => setShowEdit((v) => !v)}
        >
          <PencilLine className="h-3.5 w-3.5" />
          {showEdit ? "Close Editor" : "Edit Roles"}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showEdit ? "rotate-180" : ""}`} />
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {roles.map((r) => {
          const Icon = roleIcons[r] || (() => null);
          const meta = roleMeta[r] || {
            label: r.replace("_", " "),
            subtitle: "Preferred role",
            tone: "border-white/10 bg-white/6 text-white",
          };

          return (
            <div
              key={r}
              className={`rounded-[1.1rem] border px-3 py-3 shadow-[0_18px_40px_-32px_rgba(0,0,0,0.8)] ${meta.tone}`}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#0b1120]/70">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-base font-black uppercase tracking-[0.05em]">
                    {meta.label}
                  </div>
                  <div className="text-[11px] text-slate-300/85">
                    {meta.subtitle}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showEdit && (
        <div className="mt-5 rounded-[1.2rem] border border-white/8 bg-[#0b1120]/70 p-4 sm:p-5">
          <RoleSelectionForm initialRoles={roles} />
        </div>
      )}
    </div>
  );
}
