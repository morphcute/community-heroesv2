import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const { content, channel, teamId, tournamentId, chatRoomId } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  }

  if (content.trim().length > 1000) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  if (chatRoomId) {
    const isParticipant = await prisma.chatRoomParticipant.findFirst({
      where: { chatRoomId, userId: dbUser.id }
    });
    if (!isParticipant) {
      return NextResponse.json({ error: "Unauthorized access to chat room" }, { status: 403 });
    }
  }

  const message = await prisma.message.create({
    data: {
      content: content.trim(),
      userId: dbUser.id,
      channel: (teamId || tournamentId || chatRoomId) ? null : (channel || "general"),
      teamId: teamId || null,
      tournamentId: tournamentId || null,
      chatRoomId: chatRoomId || null,
    },
    include: {
      user: {
        select: { id: true, name: true, image: true, rank: true, mlbbId: true },
      },
    },
  });

  return NextResponse.json(message, { status: 201 });
}

