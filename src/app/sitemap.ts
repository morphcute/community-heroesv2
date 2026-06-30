import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/login`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  try {
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
      ...staticPages,
      ...tournaments.map((tournament) => ({
        url: `${siteUrl}/t/${tournament.id}`,
        lastModified: tournament.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.9,
      })),
    ];
  } catch {
    // Tables may not exist during build on CI/CD — return static pages only
    return staticPages;
  }
}
