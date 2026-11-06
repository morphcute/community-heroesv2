import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";
import LandingClient from "@/components/landing/LandingClient";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Community Heroes | Free MLBB Tournaments, Scrims & Squads",
  description:
    "Join Community Heroes — the free Mobile Legends tournament platform. Compete in tournaments, organize scrims, build your squad, and climb the ranked leaderboard.",
  keywords: [
    "MLBB tournament",
    "Mobile Legends tournament",
    "free MLBB tournament",
    "MLBB scrimmage",
    "MLBB team",
    "Mobile Legends esports",
    "Community Heroes",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Community Heroes | Free MLBB Tournaments, Scrims & Squads",
    description:
      "Compete in free MLBB tournaments, organize scrims, build your squad, and climb the ranked circuit.",
    url: siteUrl,
    siteName: "Community Heroes",
    locale: "en_US",
    type: "website",
    images: [{ url: "/ch-logo.png", width: 512, height: 512, alt: "Community Heroes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Community Heroes | Free MLBB Tournaments",
    description:
      "Compete in free MLBB tournaments, organize scrims, and build your squad.",
    images: ["/ch-logo.png"],
  },
};

export default async function RootPage() {
  const session = await auth();

  // Logged-in users go straight to their dashboard home.
  if (session?.user) {
    redirect("/home");
  }

  // Logged-out visitors see the marketing landing page.
  const parsePrize = (raw: string | null) => {
    if (!raw) return undefined;
    try {
      const parsed = JSON.parse(raw) as { total?: string | number; currency?: string };
      if (parsed?.total) return `${parsed.total}${parsed.currency ? ` ${parsed.currency}` : ""}`;
    } catch {
      return raw;
    }
    return raw;
  };

  const [rows, tournamentCount, teamCount, playerCount, scrimCount] = await Promise.all([
    prisma.tournament.findMany({
      orderBy: [{ status: "asc" }, { startDate: "asc" }],
      take: 10,
      select: {
        id: true,
        title: true,
        format: true,
        gameMode: true,
        prizePool: true,
        startDate: true,
        status: true,
        banner: true,
        maxTeams: true,
        _count: { select: { participants: true } },
      },
    }),
    prisma.tournament.count(),
    prisma.team.count(),
    prisma.user.count(),
    prisma.scrim.count(),
  ]);

  // Active events first (live, open, upcoming), then the rest.
  const rank: Record<string, number> = { ONGOING: 0, REGISTRATION_OPEN: 1, UPCOMING: 2, REGISTRATION_CLOSED: 3, COMPLETED: 4 };
  const tournaments = rows
    .sort((a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9))
    .map((t) => ({
      id: t.id,
      title: t.title,
      format: t.format,
      gameMode: t.gameMode,
      prize: parsePrize(t.prizePool),
      starts: t.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: t.status,
      banner: t.banner,
      filled: t._count.participants,
      maxTeams: t.maxTeams,
    }));

  const featured = tournaments.find((t) => ["REGISTRATION_OPEN", "ONGOING", "UPCOMING"].includes(t.status)) ?? null;

  return (
    <LandingClient
      featured={featured}
      tournaments={tournaments}
      stats={{ tournaments: tournamentCount, teams: teamCount, players: playerCount, scrims: scrimCount }}
    />
  );
}
