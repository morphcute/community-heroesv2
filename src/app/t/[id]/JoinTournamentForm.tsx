'use client';

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ChevronRight, Loader2 } from "lucide-react";
import { joinTournament } from "../../(dashboard)/tournaments/actions";

type JoinTournamentFormProps = {
  tournamentId: string;
  alreadyJoined: boolean;
  registrationMessage: string;
};

const initialState = { ok: false, message: "" };

export default function JoinTournamentForm({
  tournamentId,
  alreadyJoined,
  registrationMessage,
}: JoinTournamentFormProps) {
  const [state, formAction] = useActionState(joinTournament, initialState);
  const statusText = state.message || registrationMessage;

  return (
    <form action={formAction} className="flex flex-col gap-3 min-w-[220px]">
      <input type="hidden" name="tournamentId" value={tournamentId} />
      <SubmitButton alreadyJoined={alreadyJoined || state.ok} />
      <div className={`text-center text-xs font-mono ${state.ok ? "text-emerald-400" : "text-muted-foreground"}`}>
        {statusText}
      </div>
    </form>
  );
}

function SubmitButton({ alreadyJoined }: { alreadyJoined: boolean }) {
  const { pending } = useFormStatus();
  const disabled = pending || alreadyJoined;

  return (
    <button
      type="submit"
      disabled={disabled}
      className="h-14 px-8 bg-primary text-black font-black text-sm uppercase tracking-wider rounded-xl hover:bg-yellow-400 transition-all shadow-[0_0_30px_-10px_rgba(250,204,21,0.6)] hover:shadow-[0_0_45px_-8px_rgba(250,204,21,0.85)] flex items-center justify-center gap-2 group btn-animate-premium disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Joining...
        </>
      ) : alreadyJoined ? (
        "Registered"
      ) : (
        <span className="flex items-center gap-2">
          Join Tournament <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      )}
    </button>
  );
}
