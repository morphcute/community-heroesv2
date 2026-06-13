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
    // Return suggested players to add (who are not the current user and not friends yet)
    const suggested = await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        friends: {
          none: {
            friendId: currentUserId
          }
        },
        friendOf: {
          none: {
            userId: currentUserId
          }
        }
      },
      select: {
        id: true,
        name: true,
        image: true,
        rank: true,
        mlbbId: true
      },
      take: 5
    });
    return NextResponse.json(suggested);
  }


  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: currentUserId } },
        {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { mlbbId: { contains: query, mode: "insensitive" } }
          ]
        }
      ]
    },
    select: {
      id: true,
      name: true,
      image: true,
      rank: true,
      mlbbId: true
    },
    take: 10
  });

  return NextResponse.json(users);
}
