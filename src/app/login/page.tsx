import type { Metadata } from "next";
import { auth } from "@/auth";
import { ChevronRight, Shield, ShieldCheck, Trophy, Users, Swords } from "lucide-react";
import { redirect } from "next/navigation";
import { getSiteUrl } from "@/lib/site";
import Link from "next/link";
import { signInGoogleWithCallback } from "./actions";
import LoginArena from "@/components/LoginArena";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "MLBB Tournaments, Scrimmages, and Teams",
  description:
    "Join Community Heroes to discover MLBB tournaments, post scrimmages, build your squad, and follow Mobile Legends community competition.",
  keywords: [
    "MLBB tournament",
    "Mobile Legends tournament",
    "MLBB scrimmage",
    "Mobile Legends scrim",
    "MLBB team recruitment",
    "free MLBB tournament",
  ],
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    title: "Community Heroes | MLBB Tournaments and Scrimmages",
    description:
      "Find free MLBB tournaments, team scrimmages, and Mobile Legends squads in one community platform.",
    url: `${siteUrl}/login`,
    siteName: "Community Heroes",
    type: "website",
    images: [
      {
        url: "/ch-logo.png",
        width: 512,
        height: 512,
        alt: "Community Heroes MLBB tournaments and scrimmages",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Community Heroes | MLBB Tournaments and Scrimmages",
    description:
      "Find free MLBB tournaments, scrimmages, and team competition on Community Heroes.",
    images: ["/ch-logo.png"],
  },
};

export default async function LoginPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const error = searchParams.error;
  const callbackUrl = (Array.isArray(searchParams.callbackUrl) ? searchParams.callbackUrl[0] : searchParams.callbackUrl) || "/home";
  const session = await auth();
  if (session?.user && error !== "suspended") redirect(callbackUrl.startsWith("/") ? callbackUrl : "/home");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Community Heroes Login",
    description:
      "Community Heroes is an MLBB tournament and scrimmage platform for Mobile Legends teams and players.",
    url: `${siteUrl}/login`,
    mainEntity: {
      "@type": "Organization",
      name: "Community Heroes",
      url: siteUrl,
      logo: `${siteUrl}/ch-logo.png`,
      sameAs: [],
    },
    about: [
      "MLBB tournaments",
      "Mobile Legends scrimmages",
      "MLBB teams",
      "Free MLBB tournaments",
    ],
  };

  return (
    <div className="relative flex min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ═══════════ LEFT: KEY ART ═══════════ */}
      <div className="relative hidden w-[54%] overflow-hidden lg:block">
        <LoginArena className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/40 via-30% to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-[#060608]" />

        <div className="relative z-10 flex h-full flex-col p-12 xl:p-16">
          <Link href="/" className="flex w-fit items-center gap-3">
            <img src="/ch-logo.png" alt="" className="h-11 w-11 object-contain drop-shadow-[0_0_14px_rgba(242,193,78,0.4)]" />
            <span className="font-display text-lg font-bold uppercase tracking-[0.2em] text-white">
              Community <span className="text-primary">Heroes</span>
            </span>
          </Link>

          <div className="mt-auto max-w-lg">
            <div className="page-hero__eyebrow">Season 4 · Now open</div>
            <h1 className="mt-5 font-display text-[3.4rem] font-bold uppercase leading-[0.9] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] xl:text-[4.2rem]">
              Your legend
              <br />
              starts <span className="text-gradient-primary">here</span>
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-slate-300/80">
              Free MLBB tournaments, scrimmages and squad tools — built for competitors across Southeast Asia.
            </p>

          </div>

          <div className="mt-10 text-[11px] uppercase tracking-[0.3em] text-slate-500">Direct · Competitive · Accessible</div>
        </div>
      </div>

      {/* ═══════════ RIGHT: SIGN IN ═══════════ */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[36rem] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(242,193,78,0.14),transparent_70%)]" />

        {/* Mobile art strip */}
        <div className="relative mb-4 h-48 w-full max-w-[420px] overflow-hidden rounded-[var(--radius-hero)] border border-white/10 lg:hidden">
          <LoginArena className="absolute inset-0" compact />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#060608] to-transparent" />
        </div>
        <div className="relative mt-14 w-full max-w-[420px] lg:mt-0">
          {/* Medallion crest, overlapping the card edge */}
          <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2">
            <div className="relative h-[104px] w-[104px]">
              <div className="absolute -inset-6 rounded-full bg-primary/25 blur-2xl" />
              <div className="absolute inset-0 animate-[spin_14s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,#F2C14E,#5c3f08_25%,#FFE8A3_50%,#5c3f08_75%,#F2C14E)] motion-reduce:animate-none" />
              <div className="absolute inset-[3px] rounded-full bg-[radial-gradient(circle_at_50%_30%,#1c1a14,#08080a_70%)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]" />
              <img src="/ch-logo.png" alt="Community Heroes" className="absolute inset-[14px] h-[76px] w-[76px] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]" />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-[linear-gradient(180deg,#14131a_0%,#0b0b0f_55%,#09090c_100%)] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.95),0_0_0_1px_rgba(242,193,78,0.06)]">
            {/* gold rim + top glow */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-[120%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(242,193,78,0.16),transparent_70%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_60%)]" />

            <div className="relative px-7 pb-8 pt-[76px] sm:px-10">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
                  <span className="h-px w-5 bg-primary/60" />
                  Season 4 · Player Access
                  <span className="h-px w-5 bg-primary/60" />
                </div>
                <h2 className="mt-3 font-display text-[2.5rem] font-bold uppercase leading-[0.95] text-white">
                  Enter the <span className="text-gradient-primary">Arena</span>
                </h2>
                <p className="mx-auto mt-3 max-w-[19rem] text-[13.5px] leading-relaxed text-slate-400">
                  One tap to manage your squad, book scrims and join tournaments.
                </p>
              </div>

              {error === "suspended" && (
                <div className="mt-6 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-xs leading-relaxed text-red-300">
                  Your account has been suspended by a platform moderator or admin due to a violation of community guidelines.
                </div>
              )}

              <form action={signInGoogleWithCallback} className="mt-8">
                <input type="hidden" name="callbackUrl" value={callbackUrl} />
                <div className="rounded-[14px] bg-[linear-gradient(135deg,#FFE8A3,#B07A17_45%,#F2C14E_70%,#6b4a0c)] p-px shadow-[0_18px_40px_-14px_rgba(242,193,78,0.55)]">
                  <button
                    type="submit"
                    className="group relative flex h-[54px] w-full items-center justify-center gap-3 overflow-hidden rounded-[13px] bg-white text-[15px] font-semibold text-[#141318] transition-all hover:bg-[#fffaf0] active:scale-[0.99]"
                  >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[rgba(242,193,78,0.3)] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                    Continue with Google
                    <ChevronRight className="absolute right-4 h-4 w-4 text-[#141318]/40 transition-all group-hover:right-3 group-hover:text-[#141318]" />
                  </button>
                </div>
              </form>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Secure Google sign-in · no password needed
              </div>

              {/* perks band */}
              <div className="mt-7 grid grid-cols-3 divide-x divide-white/[0.06] rounded-xl border border-white/[0.06] bg-white/[0.02]">
                {[
                  { icon: Trophy, label: "Free events" },
                  { icon: Swords, label: "Daily scrims" },
                  { icon: Users, label: "Squad tools" },
                ].map((p) => (
                  <div key={p.label} className="flex flex-col items-center gap-1.5 px-2 py-3.5">
                    <p.icon className="h-4 w-4 text-primary" />
                    <span className="text-[10.5px] font-medium text-slate-400">{p.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* footer strip */}
            <div className="relative flex items-center justify-between gap-3 border-t border-white/[0.06] bg-black/30 px-7 py-3.5 text-[12px] sm:px-10">
              <Link href="/" className="text-slate-500 transition-colors hover:text-primary">
                ← Home
              </Link>
              <Link href="/login/admin" className="group flex items-center gap-1.5 text-slate-500 transition-colors hover:text-primary">
                <Shield className="h-3.5 w-3.5" />
                Staff login
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          <p className="mt-5 text-center text-[11px] leading-relaxed text-slate-500">
            By continuing you agree to our{" "}
            <a href="#" className="text-slate-300 underline-offset-2 hover:text-primary hover:underline">Terms</a> and{" "}
            <a href="#" className="text-slate-300 underline-offset-2 hover:text-primary hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
