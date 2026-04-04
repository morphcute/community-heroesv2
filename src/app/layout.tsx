import type { Metadata } from "next";
import { Rajdhani, Inter } from "next/font/google";
import "./globals.css";
import { getSiteUrl } from "@/lib/site";

const rajdhani = Rajdhani({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rajdhani",
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${rajdhani.variable} ${inter.variable} bg-background text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
