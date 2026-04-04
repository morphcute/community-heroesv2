import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { EmptyState, PageHero, PageShell, SurfaceCard } from "@/components/ui/PageShell";
import { Shield, User, Users, ArrowRight, Plus, Star, Check, X, Bell } from "lucide-react";
import RoleDisplay from "@/components/RoleDisplay";
import { acceptInvite, declineInvite } from "../actions";


  export default async function MyTeamPage() {
  const session = await auth();

  if (!session?.user?.email) {
    return (
      <PageShell>
        <EmptyState
          icon={<Shield className="h-8 w-8" />}
          title="Join the community"
          description="Sign in to manage your team, set your main roles, and unlock team tools."
          action={<Link href="/login" className="action-button-primary text-[11px]">Login now</Link>}
        />
      </PageShell>
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      teamMembers: {
        include: { team: true },
      },
    },
  });

  if (!user) {
    return (
      <PageShell>
        <EmptyState icon={<User className="h-8 w-8" />} title="User not found" description="We couldn't load your player profile." />
      </PageShell>
    );
  }

  const currentTeamMember = user.teamMembers.find(m => m.status === 'APPROVED');
  const invitedMemberships = user.teamMembers.filter(m => m.status === 'INVITED');
  const roleCount = Array.isArray(user.roles) ? user.roles.length : 0;
  const teamSlotLabel = currentTeamMember ? (currentTeamMember.role === 'CAPTAIN' ? "Captain" : "Member") : "Open";

  return (
    <PageShell size="wide" tone="blue">
      <PageHero
        eyebrow="My Team"
        icon={<Users className="h-4 w-4" />}
        title={
          <>
            Set your
            <span className="text-gradient-electric"> main roles</span>
          </>
        }
        description={`${user.name}, choose your main roles, keep your team aligned, and get ready faster when it is time to queue.`}
        stats={[
          { label: "Current Team", value: currentTeamMember?.team.name || "Solo" },
          { label: "Team Slot", value: teamSlotLabel },
          { label: "Roles", value: roleCount },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.3fr)_360px]">
        <SurfaceCard>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-slate-500">Player Roles</div>
              <h2 className="mt-2 font-display text-2xl font-black uppercase tracking-[0.08em] text-white">Preferred lanes</h2>
            </div>
          </div>
          <RoleDisplay roles={user?.roles as string[] || []} />
        </SurfaceCard>

        <div className="space-y-6">
          {invitedMemberships.length > 0 && (
            <SurfaceCard tone="gold">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-500">
                  <Bell className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-black uppercase text-white">Pending Invitations</h3>
                  <p className="text-xs text-slate-400">You have been invited to join a squad.</p>
                </div>
              </div>
              <div className="space-y-3">
                {invitedMemberships.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="font-bold text-sm text-white">{invite.team.name}</div>
                    <div className="flex items-center gap-2">
                       <form action={acceptInvite}>
                         <input type="hidden" name="membershipId" value={invite.id} />
                         <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 transition-colors hover:bg-emerald-500/30">
                           <Check className="h-4 w-4" />
                         </button>
                       </form>
                       <form action={declineInvite}>
                         <input type="hidden" name="membershipId" value={invite.id} />
                         <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-400 transition-colors hover:bg-red-500/30">
                           <X className="h-4 w-4" />
                         </button>
                       </form>
                    </div>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          )}

          {currentTeamMember ? (
            <SurfaceCard tone="gold">
              <div className="relative z-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="mt-5 text-[0.62rem] font-black uppercase tracking-[0.24em] text-primary">Your team</div>
                <h2 className="mt-2 font-display text-3xl font-black uppercase tracking-[0.08em] text-white">
                  {currentTeamMember.team.name}
                </h2>
                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-slate-300">
                  <Star className="h-4 w-4 text-primary" />
                  <span>You are a {currentTeamMember.role.toLowerCase()} of this team.</span>
                </div>
                <Link href={`/teams/${currentTeamMember.team.id}`} className="action-button-primary mt-6 w-full justify-center text-[11px]">
                  Team Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </SurfaceCard>
          ) : (
            <>
              <SurfaceCard>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-cyan-300">
                  <Users className="h-5 w-5" />
                </div>
                <h2 className="mt-5 font-display text-2xl font-black uppercase tracking-[0.08em] text-white">Join a team</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">Scout active teams, see who is recruiting, and request a slot.</p>
                <Link href="/teams" className="action-button-secondary mt-6 w-full justify-center text-[11px]">
                  Browse teams
                </Link>
              </SurfaceCard>

              <SurfaceCard tone="gold">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                  <Plus className="h-5 w-5" />
                </div>
                <h2 className="mt-5 font-display text-2xl font-black uppercase tracking-[0.08em] text-white">Create a team</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">Start your own team and captain a lineup built for the next tournament push.</p>
                <Link href="/teams/create" className="action-button-primary mt-6 w-full justify-center text-[11px]">
                  Start team
                </Link>
              </SurfaceCard>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}
