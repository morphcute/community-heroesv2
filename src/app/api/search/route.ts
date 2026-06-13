import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  const currentUserId = session?.user?.id;
  if (!currentUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  if (!query.trim()) {
    return NextResponse.json({ players: [], tournaments: [], teams: [] });
  }

  const normalizedQuery = query.trim();

  try {
    // Concurrently search players, tournaments, and teams
    const [players, tournaments, teams] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: normalizedQuery, mode: "insensitive" } },
            { email: { contains: normalizedQuery, mode: "insensitive" } },
            { mlbbId: { contains: normalizedQuery, mode: "insensitive" } }
          ]
        },
        select: {
          id: true,
          name: true,
          image: true,
          mlbbId: true,
          rank: true
        },
        take: 5
      }),
      prisma.tournament.findMany({
        where: {
          title: { contains: normalizedQuery, mode: "insensitive" }
        },
        select: {
          id: true,
          title: true,
          banner: true,
          prizePool: true,
          gameMode: true
        },
        take: 5
      }),
      prisma.team.findMany({
        where: {
          name: { contains: normalizedQuery, mode: "insensitive" }
        },
        select: {
          id: true,
          name: true,
          logo: true,
          description: true
        },
        take: 5
      })
    ]);

    return NextResponse.json({ players, tournaments, teams });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
