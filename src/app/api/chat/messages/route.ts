import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel");
  const teamId = searchParams.get("teamId");
  const tournamentId = searchParams.get("tournamentId");
  const chatRoomId = searchParams.get("chatRoomId");
  const cursor = searchParams.get("cursor") || undefined;

  const session = await auth();
  const currentUserId = session?.user?.id;

  if (chatRoomId) {
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const participant = await prisma.chatRoomParticipant.findFirst({
      where: { chatRoomId, userId: currentUserId }
    });
    if (!participant) {
      return NextResponse.json({ error: "Unauthorized access to chat room" }, { status: 403 });
    }
  }

  const where = chatRoomId
    ? { chatRoomId }
    : tournamentId
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

