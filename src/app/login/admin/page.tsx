import { auth, signIn } from "@/auth";
import { ArrowLeft, ChevronRight, ShieldAlert, Terminal, Lock } from "lucide-react";
import { redirect } from "next/navigation";
import DevLoginForm from "./DevLoginForm";

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user) redirect("/home");

  return (
    <div className="flex min-h-screen bg-[#04040a]">
      {/* Left abstract decoration */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden border-r border-white/5 bg-[#080812] p-12 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.06),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.04),transparent_40%)]" />
        
        <div className="relative z-10 flex items-center gap-3 text-red-500">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
            <Lock className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-black uppercase tracking-widest text-pink-400">Developer Console</span>
        </div>

        <div className="relative z-10">
          <h1 className="font-display text-5xl font-black uppercase leading-[1.1] tracking-tight text-white">
            System
            <span className="block text-primary">Command</span>
          </h1>
          <p className="mt-6 max-w-md text-slate-400">
            This entry point is reserved for verified platform administrators and moderators. Unauthorized access is logged and strictly prohibited.
          </p>
          
          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4">
              <ShieldAlert className="mb-2 h-6 w-6 text-red-400" />
              <div className="font-display text-sm font-bold uppercase tracking-wide text-white">Security</div>
              <div className="mt-1 text-xs text-red-300/50">Level 4 clearance</div>
            </div>
            <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
              <Terminal className="mb-2 h-6 w-6 text-primary" />
              <div className="font-display text-sm font-bold uppercase tracking-wide text-white">Control</div>
              <div className="mt-1 text-xs text-primary/50">Root management</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Container */}
      <DevLoginForm />
    </div>
  );
}
