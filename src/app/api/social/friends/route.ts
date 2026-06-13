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

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { userId: currentUserId },
        { friendId: currentUserId }
      ]
    },
    include: {
      user: {
        select: { id: true, name: true, image: true, rank: true, mlbbId: true }
      },
      friend: {
        select: { id: true, name: true, image: true, rank: true, mlbbId: true }
      }
    }
  });

  const friends: any[] = [];
  const pendingReceived: any[] = [];
  const pendingSent: any[] = [];

  for (const f of friendships) {
    if (f.status === "ACCEPTED") {
      const peer = f.userId === currentUserId ? f.friend : f.user;
      friends.push({
        friendshipId: f.id,
        user: peer
      });
    } else if (f.status === "PENDING") {
      if (f.userId === currentUserId) {
        pendingSent.push({
          friendshipId: f.id,
          user: f.friend
        });
      } else {
        pendingReceived.push({
          friendshipId: f.id,
          user: f.user
        });
      }
    }
  }

  return NextResponse.json({
    friends,
    pendingReceived,
    pendingSent
  });
}
