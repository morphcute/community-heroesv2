import type { Metadata } from "next";
import { Rajdhani, Inter, Outfit } from "next/font/google";
import "./globals.css";
import { getSiteUrl } from "@/lib/site";
import { ThemeProvider } from "@/components/ThemeProvider";
import { prisma } from "@/lib/prisma";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Community Heroes | MLBB Tournaments and Teams",
    template: "%s | Community Heroes",
  },
  description:
    "Community Heroes is an MLBB tournament platform where players join Mobile Legends tournaments, build teams, track brackets, and compete in community events.",
  keywords: [
    "MLBB tournament",
    "Mobile Legends tournament",
    "MLBB teams",
    "Mobile Legends community",
    "MLBB bracket",
    "Mobile Legends esports",
    "Community Heroes",
  ],
  applicationName: "Community Heroes",
  category: "gaming",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Community Heroes | MLBB Tournaments and Teams",
    description:
      "Join MLBB tournaments, create teams, track brackets, and compete in Community Heroes events.",
    url: siteUrl,
    siteName: "Community Heroes",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/ch-logo.png",
        width: 512,
        height: 512,
        alt: "Community Heroes MLBB tournament platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Community Heroes | MLBB Tournaments and Teams",
    description:
      "Join MLBB tournaments, create teams, and track brackets with Community Heroes.",
    images: ["/ch-logo.png"],
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let iconUrl = "/ch-logo.png";
  let backgroundUrl = "/bg-dark.jpg";

  try {
    const iconSetting = await prisma.systemSetting.findUnique({ where: { key: "icon_url" } });
    if (iconSetting) iconUrl = iconSetting.value;

    const bgSetting = await prisma.systemSetting.findUnique({ where: { key: "background_url" } });
    if (bgSetting) backgroundUrl = bgSetting.value;
  } catch {
    // Tables may not exist during build on CI/CD — use defaults
  }

  let backgroundStyle = `linear-gradient(rgba(3, 5, 12, 0.3), rgba(3, 5, 12, 0.5)), url('${backgroundUrl}')`;
  if (backgroundUrl.startsWith("linear-gradient") || backgroundUrl.startsWith("radial-gradient")) {
    backgroundStyle = backgroundUrl;
  } else if (backgroundUrl.startsWith("#") || backgroundUrl.startsWith("rgb")) {
    backgroundStyle = backgroundUrl;
  }

  return (
    <html lang="en" className="dark" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href={iconUrl} />
        <style dangerouslySetInnerHTML={{__html: `
          html.dark body {
            background-image: ${backgroundStyle} !important;
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            background-attachment: fixed !important;
          }
        `}} />
      </head>
      <body
        suppressHydrationWarning
        className={`${rajdhani.variable} ${inter.variable} ${outfit.variable} bg-background text-foreground antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
