import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const awards = await (prisma as any).award.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5, // recent 5 awards
    select: {
      amount: true,
      currency: true,
      createdAt: true,
      tournament: { select: { title: true } },
    },
  });

  const total = awards.reduce(
    (acc: any, a: any) => {
      if (a.currency === "DIAMONDS") acc.diamonds += a.amount;
      else acc.cash += a.amount;
      return acc;
    },
    { diamonds: 0, cash: 0 }
  );

  return NextResponse.json({ total, recent: awards });
}
