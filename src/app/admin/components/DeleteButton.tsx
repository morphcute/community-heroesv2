"use client";

import { useState } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";

interface DeleteButtonProps {
  id: string;
  action: (id: string) => Promise<void>;
  confirmMessage?: string;
}

export function DeleteButton({
  id,
  action,
  confirmMessage = "Are you sure you want to delete this item?",
}: DeleteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    setShowModal(false);
    setLoading(true);
    try {
      await action(id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={loading}
        onClick={() => setShowModal(true)}
        className="rounded-xl border border-border bg-muted p-2 text-muted-foreground transition-colors hover:text-rose-300 disabled:opacity-50 cursor-pointer"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-black uppercase tracking-wider text-foreground">Confirm Action</h3>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {confirmMessage}
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
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold uppercase tracking-wider text-white transition-colors shadow-[0_0_15px_rgba(225,29,72,0.3)] cursor-pointer"
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
