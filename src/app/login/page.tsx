import type { Metadata } from "next";
import { auth } from "@/auth";
import { ChevronRight, Shield, Zap, Gamepad2, Trophy, Users, Swords, BadgeDollarSign, Star, Target } from "lucide-react";
import { redirect } from "next/navigation";
import { getSiteUrl } from "@/lib/site";
import Link from "next/link";
import { signInGoogleWithCallback } from "./actions";

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
    <div className="relative flex min-h-screen bg-[#03050c]">
      {/* Full-page background effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(250,204,21,0.08),transparent_50%),radial-gradient(ellipse_at_80%_70%,rgba(7,11,26,0.95),transparent_50%),radial-gradient(ellipse_at_50%_50%,rgba(255,215,0,0.02),transparent_60%)]" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ═══════════ DESKTOP LEFT PANEL ═══════════ */}
      <div className="relative hidden w-[52%] flex-col justify-between overflow-hidden lg:flex">

        {/* Floating orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-primary/8 blur-[100px]" style={{ animation: "drift-orb 20s ease-in-out infinite alternate" }} />
          <div className="absolute -right-16 bottom-1/3 h-56 w-56 rounded-full bg-amber-500/5 blur-[80px]" style={{ animation: "drift-orb 16s ease-in-out infinite alternate-reverse" }} />
          <div className="absolute left-1/3 top-12 h-32 w-32 rounded-full bg-purple-500/3 blur-[60px]" style={{ animation: "drift-orb 24s ease-in-out infinite alternate" }} />
        </div>

        {/* Subtle divider line */}
        <div className="absolute -right-px inset-y-0 w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-1 flex-col justify-between p-12 xl:p-16">
          {/* Top: Logo - aligned to avoid overlapping */}
          <div className="flex items-center gap-2">
            <span className="text-[#FFD700] font-black text-2xl font-display">/</span>
            <span className="font-display text-lg font-black uppercase tracking-[0.2em] text-white">
              Community Heroes
            </span>
          </div>

          {/* Center: Hero copy */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5">
              <Star className="h-3.5 w-3.5 text-primary" />
              <span className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-primary">Community Platform</span>
            </div>

            <h1 className="font-display text-[3.2rem] font-black uppercase leading-[1.05] tracking-tight text-white xl:text-[3.8rem]">
              MLBB Tournaments,
              <span className="mt-1 block text-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                Scrims &amp; Teams
              </span>
            </h1>

            <p className="max-w-md text-sm leading-relaxed text-slate-400">
              Discover free tournaments, post scrimmages, and build a stronger Mobile Legends squad — all in one competitive platform.
            </p>

            {/* Feature cards using our new tech card styling */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              <div className="esports-card group p-5 text-left">
                <Trophy className="mb-3 h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                <div className="font-display text-[10px] font-bold uppercase tracking-wider text-white">Tournaments</div>
                <div className="mt-1 text-[9px] leading-relaxed text-slate-500">Free community brackets</div>
              </div>
              <div className="esports-card group p-5 text-left">
                <Swords className="mb-3 h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                <div className="font-display text-[10px] font-bold uppercase tracking-wider text-white">Scrimmages</div>
                <div className="mt-1 text-[9px] leading-relaxed text-slate-500">Challenge active squads</div>
              </div>
              <div className="esports-card group p-5 text-left">
                <Users className="mb-3 h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                <div className="font-display text-[10px] font-bold uppercase tracking-wider text-white">Squads</div>
                <div className="mt-1 text-[9px] leading-relaxed text-slate-500">Find teammates fast</div>
              </div>
            </div>
          </div>

          {/* Bottom: Social proof */}
          <div className="flex items-center gap-6">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#03050c] bg-gradient-to-br from-slate-700 to-slate-800 text-[0.55rem] font-bold text-slate-300">
                  {["CH", "ML", "PH", "SG"][i]}
                </div>
              ))}
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">Active community</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Teams competing across SEA</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ RIGHT LOGIN CONTAINER ═══════════ */}
      <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 lg:p-12 xl:p-16 relative z-10">
        <div className="w-full max-w-md lg:max-w-[420px]">

          {/* ——— Mobile header ——— */}
          <div className="mb-6 rounded-xl border border-white/5 bg-[#060914]/80 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.5)] lg:hidden text-left">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[#FFD700] font-black text-lg font-display">/</span>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Community Heroes</span>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Browse tournaments, scrimmages, and squad activity in a cleaner mobile flow.
                </p>
              </div>
              <img
                src="/ch-logo.png"
                alt="Community Heroes"
                className="h-auto w-full max-w-[72px] flex-shrink-0 object-contain drop-shadow-[0_0_20px_rgba(250,204,21,0.25)]"
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-white/5 bg-white/5 p-2 text-center">
                <Trophy className="h-3.5 w-3.5 text-primary mx-auto" />
                <div className="mt-1 text-[8px] font-black uppercase tracking-wider text-white">Free Tourneys</div>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/5 p-2 text-center">
                <Swords className="h-3.5 w-3.5 text-primary mx-auto" />
                <div className="mt-1 text-[8px] font-black uppercase tracking-wider text-white">Scrims</div>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/5 p-2 text-center">
                <BadgeDollarSign className="h-3.5 w-3.5 text-primary mx-auto" />
                <div className="mt-1 text-[8px] font-black uppercase tracking-wider text-white">Prize Events</div>
              </div>
            </div>
          </div>
          {/* ——— End mobile card ——— */}

          {/* Sign-in form wrapper — styled as an esports-card */}
          <div className="esports-card p-6 sm:p-8 text-left shadow-[0_24px_60px_rgba(0,0,0,0.6)]">

            {/* Welcome badge */}
            <div className="mb-2 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
              <span className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-slate-500">Secure Login</span>
            </div>

            {error === "suspended" && (
              <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs leading-relaxed text-red-400">
                Your account has been suspended by a platform moderator or admin due to a violation of community guidelines.
              </div>
            )}

            <div>
              <h2 className="font-display text-[2rem] font-black uppercase tracking-[0.05em] text-white sm:text-[2.2rem] lg:leading-[1.1]">
                Sign In
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Access your team dashboard, track scrim results, and join MLBB tournaments faster.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <form action={signInGoogleWithCallback}>
                <input type="hidden" name="callbackUrl" value={callbackUrl} />
                <button type="submit" className="cyber-login-btn group">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white p-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-transform duration-300 group-hover:scale-105">
                      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-white text-sm">Continue with Google</div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-wider">Recommended &middot; fastest setup</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4.5 w-4.5 text-slate-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                </button>
              </form>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="bg-[#03050c] px-3 uppercase tracking-widest text-slate-500">Other Methods</span>
                </div>
              </div>

              <Link href="/login/admin" className="cyber-login-btn group flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-slate-400 group-hover:text-primary transition-colors">
                    <Shield className="h-4.5 w-4.5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-300 text-sm">Developer / Admin Login</div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">Access restricted console</div>
                  </div>
                </div>
                <Zap className="h-3.5 w-3.5 text-primary transition-transform duration-300 group-hover:scale-110" />
              </Link>
            </div>

            <div className="mt-8 text-center lg:text-left">
              <p className="text-[10px] text-slate-500">
                By connecting your account, you agree to the{" "}
                <a href="#" className="font-medium text-slate-400 hover:text-white">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="font-medium text-slate-400 hover:text-white">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
