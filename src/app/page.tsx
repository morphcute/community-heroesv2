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
  const featured = await prisma.tournament.findFirst({
    where: { status: { in: ["REGISTRATION_OPEN", "ONGOING", "UPCOMING"] } },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, format: true, gameMode: true, prizePool: true, startDate: true, status: true },
  });

  let featuredPrize: string | undefined;
  if (featured?.prizePool) {
    try {
      const parsed = JSON.parse(featured.prizePool) as { total?: string | number; currency?: string };
      if (parsed?.total) featuredPrize = `${parsed.total}${parsed.currency ? ` ${parsed.currency}` : ""}`;
    } catch {
      featuredPrize = featured.prizePool;
    }
  }

  return (
    <LandingClient
      featured={
        featured
          ? {
              id: featured.id,
              title: featured.title,
              format: featured.format,
              gameMode: featured.gameMode,
              prize: featuredPrize,
              starts: featured.startDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              status: featured.status,
            }
          : null
      }
    />
  );
}
