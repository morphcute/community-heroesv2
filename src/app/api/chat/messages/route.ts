import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel");
  const teamId = searchParams.get("teamId");
  const tournamentId = searchParams.get("tournamentId");
  const cursor = searchParams.get("cursor") || undefined;

  const where = tournamentId
    ? { tournamentId }
    : teamId
      ? { teamId }
      : { channel: channel || "general" };

  const messages = await prisma.message.findMany({
    where,
    orderBy: { createdAt: "asc" },
    take: 50,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      user: {
        select: { id: true, name: true, image: true, rank: true, mlbbId: true, roles: true },
      },
    },
  });

  return NextResponse.json(messages);
}
