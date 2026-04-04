import { Search, Shield, UserCheck, UserPlus, Users } from "lucide-react";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PageHero, PageShell, SurfaceCard } from "@/components/ui/PageShell";

type SessionUserWithRole = {
  role?: string;
};

export default async function AdminUsersPage() {
  const session = await auth();
  const currentUserRole = (session?.user as SessionUserWithRole | undefined)?.role;
  if (currentUserRole !== "SUPERADMIN" && currentUserRole !== "MODERATOR") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  async function elevateUser(formData: FormData) {
    "use server";
    const authSession = await auth();
    if ((authSession?.user as SessionUserWithRole | undefined)?.role !== "SUPERADMIN") return;

    const email = formData.get("email") as string;
    if (!email) return;

    const existingData = await prisma.user.findUnique({ where: { email } });
    if (existingData) {
      await prisma.user.update({ where: { email }, data: { role: Role.MODERATOR } });
    } else {
      await prisma.user.create({ data: { email, role: Role.MODERATOR, name: "New Moderator" } });
    }
    revalidatePath("/admin/users");
  }

  return (
    <PageShell size="wide" tone="danger">
      <PageHero
        eyebrow="User Directory"
        icon={<Users className="h-4 w-4" />}
        title="Manage platform users"
        description="Review recent signups, role assignments, and moderator elevation from a cleaner control surface."
        stats={[
          { label: "Loaded", value: users.length },
          { label: "Moderators", value: users.filter((user) => user.role === Role.MODERATOR).length },
          { label: "Admins", value: users.filter((user) => user.role === Role.SUPERADMIN).length },
        ]}
      />

      {currentUserRole === "SUPERADMIN" ? (
        <SurfaceCard tone="danger">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-300/20 bg-red-300/10 text-red-200">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-red-200">Superadmin control</div>
              <h2 className="mt-2 font-display text-2xl font-black uppercase tracking-[0.08em] text-white">Grant moderator access</h2>
            </div>
          </div>
          <form action={elevateUser} className="flex flex-col gap-3 sm:flex-row">
            <input type="email" name="email" placeholder="Moderator email address" required className="input-hud flex-1" />
            <button type="submit" className="action-button-primary text-[11px]">
              <UserPlus className="h-4 w-4" />
              Grant Access
            </button>
          </form>
        </SurfaceCard>
      ) : null}

      <SurfaceCard className="p-0">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input type="text" placeholder="Search users..." className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
          </div>
        </div>

        <div className="custom-scrollbar overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left">
                {["User", "Role", "Rank", "Joined"].map((heading) => (
                  <th key={heading} className="px-6 py-4 text-[0.62rem] font-black uppercase tracking-[0.24em] text-slate-500">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const role = user.role || Role.USER;
                const isAdmin = role === "SUPERADMIN";
                const isMod = role === "MODERATOR";

                return (
                  <tr key={user.id} className="border-b border-white/8 transition-colors hover:bg-white/[0.03]">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/6 text-sm font-black text-slate-300">
                          {user.image ? <img src={user.image} alt="" className="h-full w-full object-cover" /> : (user.name || "U").charAt(0)}
                        </div>
                        <div>
                          <div className="font-display text-xl font-black uppercase tracking-[0.08em] text-white">{user.name || "Anon Player"}</div>
                          <div className="mt-1 text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.22em] text-slate-300">
                        {isAdmin ? <Shield className="h-3.5 w-3.5 text-primary" /> : isMod ? <UserCheck className="h-3.5 w-3.5 text-cyan-300" /> : <Users className="h-3.5 w-3.5 text-slate-500" />}
                        {role}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-300">{user.rank || "Unranked"}</td>
                    <td className="px-6 py-5 text-sm text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </PageShell>
  );
}
