// src/app/login/admin/DevLoginForm.tsx
"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { signInGoogle, signInCredentials } from "./actions";
// Inline Google SVG component
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 533.5 544.3" {...props}>
      <path fill="#4285F4" d="M533.5 278.4c0-18.6-1.6-36.4-4.6-53.7H272v101.5h146.9c-6.4 34.5-25.5 63.8-54.3 84.2v69.8h87.7c51.5-47.5 81.2-117.5 81.2-202.8"/>
      <path fill="#34A853" d="M272 544.3c73.5 0 135.2-24.4 180.3-66.3l-87.7-69.8c-24.3 16.3-55.4 25.8-92.6 25.8-71.1 0-131.4-48-153.1-112.6H28.1v70.7c45.9 90.2 139.5 152.2 243.9 152.2"/>
      <path fill="#FBBC05" d="M118.9 321.4c-10.4-31.2-10.4-64.9 0-96.1V154.6H28.1c-41.9 81.6-41.9 177.9 0 259.5l90.8-70.7"/>
      <path fill="#EA4335" d="M272 107.9c39.9-.6 78.5 15.1 107.5 43.3l80.5-80.5C410.5 21.8 342.5-1 272 0 167.6 0 74 62 28.1 152.2l90.8 70.7C140.6 155.9 200.9 107.9 272 107.9"/>
    </svg>
  );
}

import styles from "./DevLoginForm.module.css";

export default function DevLoginForm() {
  const [activeTab, setActiveTab] = useState<"google" | "credentials">("google");




  // We'll use a server action for credentials sign-in
// No client-side handler needed; the form will directly call the server action


  return (
    <div className={styles.card}>
      {/* Tab Switcher */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "google" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("google")}
        >
          Google
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "credentials" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("credentials")}
        >
          Credentials
        </button>
      </div>

      {activeTab === "google" && (
          <form action={signInGoogle} className="mb-6">
            <button
              type="submit"
              className="cyber-login-btn w-full group flex items-center justify-between"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white p-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-transform duration-300 group-hover:scale-105">
                  <GoogleIcon className="h-4.5 w-4.5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white text-sm">Continue with Google</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider">
                    Authorize via Google Workspace
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4.5 w-4.5 text-slate-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
            </button>
          </form>
        )}

      {activeTab === "credentials" && (
          <form action={signInCredentials} method="post" className="flex flex-col gap-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                Admin Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="admin@ch-tournament.com"
                required
                className="input-hud w-full"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                Terminal Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••••••"
                required
                className="input-hud w-full"
              />
            </div>
            <button
              type="submit"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 py-3.5 font-bold text-white transition-all shadow-[0_0_15px_rgba(220,38,38,0.25)] active:scale-[0.98]"
            >
              Authorize Session
              <ChevronRight className="h-5 w-5" />
            </button>
          </form>
        )}
    </div>
  );
}
