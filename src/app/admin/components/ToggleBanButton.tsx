"use client";

import { useState } from "react";
import { ShieldAlert, ShieldCheck, Loader2, AlertTriangle } from "lucide-react";

interface ToggleBanButtonProps {
  userId: string;
  isBanned: boolean;
  action: (userId: string) => Promise<void>;
}

export function ToggleBanButton({ userId, isBanned, action }: ToggleBanButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleToggle = async () => {
    setShowModal(false);
    setLoading(true);
    try {
      await action(userId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const actionText = isBanned ? "unban" : "suspend";

  return (
    <>
      <button
        type="button"
        disabled={loading}
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-black uppercase tracking-wide transition-all cursor-pointer ${
          isBanned
            ? "bg-green-500/10 border-green-500/25 text-green-400 hover:bg-green-500/20"
            : "bg-red-500/10 border-red-500/25 text-red-400 hover:bg-red-500/20"
        }`}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isBanned ? (
          <>
            <ShieldCheck className="w-3.5 h-3.5" />
            Unban
          </>
        ) : (
          <>
            <ShieldAlert className="w-3.5 h-3.5" />
            Ban
          </>
        )}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                isBanned ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
              }`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-black uppercase tracking-wider text-foreground">Confirm Account Moderation</h3>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Are you sure you want to {actionText} this user's account?
              {!isBanned && " Banned users will be blocked from accessing their dashboard and tournaments."}
            </p>
            
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl border border-border bg-muted hover:bg-muted/80 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggle}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-colors shadow-lg cursor-pointer ${
                  isBanned
                    ? "bg-green-600 hover:bg-green-500 shadow-green-600/30"
                    : "bg-red-600 hover:bg-red-500 shadow-red-600/30"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
