import { auth, signIn } from "@/auth";
import { ArrowLeft, ChevronRight, ShieldAlert, Terminal, Lock } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="flex min-h-screen bg-[#04040a]">
      {/* Left abstract decoration */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden border-r border-red-500/10 bg-[#0a0404] p-12 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(185,28,28,0.05),transparent_40%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        
        <div className="relative z-10 flex items-center gap-3 text-red-500">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
            <Lock className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-black uppercase tracking-widest text-red-500">Restricted Area</span>
        </div>

        <div className="relative z-10">
          <h1 className="font-display text-5xl font-black uppercase leading-[1.1] tracking-tight text-white">
            System
            <span className="block text-red-500">Command</span>
          </h1>
          <p className="mt-6 max-w-md text-red-200/60">
            This entry point is reserved for verified platform administrators and moderators. Unauthorized access is logged and strictly prohibited.
          </p>
          
          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4">
              <ShieldAlert className="mb-2 h-6 w-6 text-red-400" />
              <div className="font-display text-sm font-bold uppercase tracking-wide text-white">Security</div>
              <div className="mt-1 text-xs text-red-300/50">Level 4 clearance</div>
            </div>
            <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4">
              <Terminal className="mb-2 h-6 w-6 text-red-500" />
              <div className="font-display text-sm font-bold uppercase tracking-wide text-white">Control</div>
              <div className="mt-1 text-xs text-red-300/50">Root management</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Container */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md">
          <Link href="/login" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to player login
          </Link>

          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center gap-3 lg:justify-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                <Terminal className="h-6 w-6" />
              </div>
            </div>
            <h2 className="mt-6 font-display text-3xl font-black uppercase tracking-wide text-white">
              Initialize Terminal
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Authenticate with an authorized administrator account to access platform controls.
            </p>
          </div>

          <form
            action={async (formData) => {
              "use server";
              const email = formData.get("email");
              const password = formData.get("password");
              await signIn("credentials", { email, password, redirectTo: "/" });
            }}
            className="mt-10 flex flex-col gap-5"
          >
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Admin Email</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="admin@ch-tournament.com"
                  required
                  className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-red-500/50 focus:bg-red-500/5"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Terminal Password</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••••••"
                  required
                  className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-red-500/50 focus:bg-red-500/5"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 font-bold text-white transition-all hover:bg-red-500 active:scale-[0.98]"
            >
              Authorize Session
              <ChevronRight className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-10 text-center lg:text-left">
            <p className="text-xs text-slate-600">
              System access is actively monitored. Any unauthorized attempts will be reported.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
