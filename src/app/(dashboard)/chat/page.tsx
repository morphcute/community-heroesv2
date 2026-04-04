import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ChatPageClient from "./ChatPageClient";

export const dynamic = "force-dynamic";

export default async function CommunicationsPage() {
  const session = await auth();
  const sessionEmail = session?.user?.email ?? null;

  let userTeams: { id: string, name: string }[] = [];
  let userTournaments: { id: string, title: string }[] = [];
  let userId: string | null = null;

  if (sessionEmail) {
    const dbUser = await prisma.user.findUnique({
      where: { email: sessionEmail },
      include: { 
        captainOf: { select: { id: true, name: true } },
        participations: { include: { tournament: { select: { id: true, title: true } } } },
        teamMembers: {
          include: {
            team: {
              include: {
                participations: { include: { tournament: { select: { id: true, title: true } } } }
              }
            }
          }
        }
      }
    });

    userId = dbUser?.id ?? null;
    userTeams = dbUser?.captainOf || [];
    
    // Extract unique tournaments user is part of (solo or via squad)
    const tMap = new Map();
    dbUser?.participations.forEach(p => tMap.set(p.tournament.id, p.tournament));
    dbUser?.teamMembers.forEach(tm => {
      tm.team.participations.forEach(p => tMap.set(p.tournament.id, p.tournament));
    });
    userTournaments = Array.from(tMap.values());
  }

  return (
    <ChatPageClient
      currentUserId={userId}
      userTeams={userTeams}
      userTournaments={userTournaments}
    />
  );
}
