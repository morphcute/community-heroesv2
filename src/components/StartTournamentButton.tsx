"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Play, Loader2 } from "lucide-react";
import { startTournamentManual } from "@/app/(dashboard)/tournaments/actions";

type StartTournamentButtonProps = {
  tournamentId: string;
};

const initialState = { ok: false, message: "" };

export default function StartTournamentButton({ tournamentId }: StartTournamentButtonProps) {
  const [state, formAction] = useActionState(startTournamentManual, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="tournamentId" value={tournamentId} />
      <SubmitButton />
      {state.message && (
        <div className={`text-xs font-semibold ${state.ok ? "text-emerald-400" : "text-rose-400"}`}>
          {state.message}
        </div>
      )}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="h-12 px-8 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_-10px_rgba(245,158,11,0.6)] disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Starting...
        </>
      ) : (
        <>
          <Play className="w-3.5 h-3.5 fill-black" />
          Start Tournament
        </>
      )}
    </button>
  );
}
