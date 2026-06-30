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
    tone: "border-amber-300/18 bg-amber-300/10 text-amber-200",
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
    tone: "border-slate-300/18 bg-slate-300/10 text-slate-200",
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
    <div className="hud-panel">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="text-[0.58rem] font-black uppercase tracking-[0.25em] text-slate-500">
            Selected Lanes
          </div>
          <h3 className="mt-1.5 font-display text-lg sm:text-xl font-black uppercase tracking-[0.06em] text-foreground">
            Your comfort picks
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
            Show teammates where you perform best before queue or tournament registration.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2.5 text-[0.62rem] font-black uppercase tracking-[0.16em] text-primary transition-all hover:border-primary/35 hover:bg-primary/14 w-full sm:w-auto"
          onClick={() => setShowEdit((v) => !v)}
        >
          <PencilLine className="h-3.5 w-3.5" />
          {showEdit ? "Close Editor" : "Edit Roles"}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showEdit ? "rotate-180" : ""}`} />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3">
        {roles.map((r) => {
          const Icon = roleIcons[r] || (() => null);
          const meta = roleMeta[r] || {
            label: r.replace("_", " "),
            subtitle: "Preferred role",
            tone: "border-border bg-muted text-foreground",
          };

          return (
            <div
              key={r}
              className={`rounded-xl border px-2.5 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.05)] ${meta.tone}`}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7.5 w-7.5 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-xs font-black uppercase tracking-[0.05em] truncate">
                    {meta.label}
                  </div>
                  <div className="hidden sm:block text-[9px] text-muted-foreground truncate">
                    {meta.subtitle}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showEdit && (
        <div className="mt-5 rounded-[1.2rem] border border-border bg-background p-4 sm:p-5">
          <RoleSelectionForm initialRoles={roles} />
        </div>
      )}
    </div>
  );
}
