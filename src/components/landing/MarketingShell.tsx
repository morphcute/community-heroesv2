"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X, Info, Sparkles, Trophy, Route } from "lucide-react";

export const marketingNav = [
  { label: "Tournaments", href: "/#featured", icon: Trophy },
  { label: "Features", href: "/features", icon: Sparkles },
  { label: "How it works", href: "/#how", icon: Route },
  { label: "About", href: "/about", icon: Info },
];

/** Shared header + footer for the public pages (landing, about, features). */
export default function MarketingShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden text-foreground">
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled || mobileNav ? "border-b border-white/[0.06] bg-[#060608]/95 backdrop-blur-xl" : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/ch-logo.png" alt="" className="h-9 w-9 object-contain drop-shadow-[0_0_10px_rgba(242,193,78,0.3)]" />
            <span className="font-display text-[15px] font-bold uppercase tracking-[0.18em] text-white">
              Community <span className="text-primary">Heroes</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {marketingNav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group relative flex flex-col items-center gap-1 rounded-lg px-4 py-1.5 text-[11.5px] font-semibold transition-colors ${active ? "text-white" : "text-slate-400 hover:text-white"}`}
                >
                  <item.icon className={`h-[18px] w-[18px] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-primary group-hover:drop-shadow-[0_0_8px_rgba(242,193,78,0.8)] ${active ? "text-primary" : ""}`} />
                  {item.label}
                  <span className={`absolute -bottom-1 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-primary shadow-[0_0_8px_rgba(242,193,78,0.9)] transition-all duration-300 ${active ? "w-6" : "w-0 group-hover:w-6"}`} />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-[13px] font-medium text-slate-300 transition-colors hover:text-primary sm:block">
              Sign in
            </Link>
            <Link href="/login" className="action-button-primary hidden min-h-[40px] px-5 text-[0.75rem] sm:inline-flex">
              Join the Arena
            </Link>
            <button
              onClick={() => setMobileNav((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-300 md:hidden"
              aria-label="Toggle menu"
              aria-expanded={mobileNav}
            >
              {mobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileNav && (
          <div className="border-t border-white/10 px-4 py-3 md:hidden">
            {marketingNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileNav(false)}
                className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/login" className="action-button-primary mt-2 w-full">
              Join the Arena
            </Link>
          </div>
        )}
      </header>

      {children}

      <footer className="border-t border-white/[0.05] pt-14 pb-10">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-10 px-4 sm:px-6 md:grid-cols-[2fr_1fr_1fr_1fr] lg:px-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <img src="/ch-logo.png" alt="" className="h-9 w-9 object-contain" />
              <span className="font-display text-sm font-bold uppercase tracking-[0.18em] text-slate-200">Community Heroes</span>
            </div>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-slate-500">
              The free competitive hub for Mobile Legends: Bang Bang players across Southeast Asia.
            </p>
          </div>
          {[
            { title: "Platform", links: [{ l: "Features", h: "/features" }, { l: "Tournaments", h: "/#featured" }, { l: "How it works", h: "/#how" }] },
            { title: "Community", links: [{ l: "About us", h: "/about" }, { l: "FAQ", h: "/about#faq" }] },
            { title: "Account", links: [{ l: "Sign in", h: "/login" }, { l: "Join free", h: "/login" }] },
          ].map((col) => (
            <div key={col.title}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">{col.title}</div>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.l}>
                    <Link href={link.h} className="text-[13px] text-slate-400 transition-colors hover:text-primary">
                      {link.l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-12 flex w-full max-w-7xl flex-col items-center justify-between gap-3 border-t border-white/[0.05] px-4 pt-6 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <span>© 2026 Community Heroes · Built for Mobile Legends competitors.</span>
          <span>Not affiliated with Moonton.</span>
        </div>
      </footer>
    </div>
  );
}

/** Reusable page-top hero for public sub-pages. */
export function MarketingHero({ eyebrow, title, description, children }: { eyebrow: string; title: ReactNode; description: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden pt-36 pb-16 sm:pt-44 sm:pb-24">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_60%_70%_at_50%_20%,black,transparent)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[460px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(242,193,78,0.16),transparent_65%)]" />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <div className="page-hero__eyebrow mx-auto">{eyebrow}</div>
        <h1 className="mt-6 font-display text-[2.9rem] font-bold uppercase leading-[0.92] text-white sm:text-6xl lg:text-7xl">{title}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">{description}</p>
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, align = "left" }: { eyebrow: string; title: ReactNode; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <div className={`page-hero__eyebrow ${align === "center" ? "mx-auto" : ""}`}>{eyebrow}</div>
      <h2 className="mt-4 font-display text-4xl font-bold uppercase leading-[0.95] text-white md:text-5xl">{title}</h2>
    </div>
  );
}
