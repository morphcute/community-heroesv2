import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/login", "/t/", "/sitemap.xml"],
        disallow: ["/admin", "/api", "/chat", "/events", "/leaderboard", "/profile", "/scrims", "/teams", "/tournaments"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
