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

  const rooms = await prisma.chatRoom.findMany({
    where: {
      participants: {
        some: { userId: currentUserId }
      }
    },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, image: true, rank: true, mlbbId: true }
          }
        }
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          user: { select: { name: true } }
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return NextResponse.json(rooms);
}
