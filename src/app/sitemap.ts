import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const tournaments = await prisma.tournament.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return [
    {
      url: `${siteUrl}/login`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    ...tournaments.map((tournament) => ({
      url: `${siteUrl}/t/${tournament.id}`,
      lastModified: tournament.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
  ];
}
