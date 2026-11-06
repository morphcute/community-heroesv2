/**
 * Coded MLBB-tournament key art for the sign-in page.
 * A championship trophy on a stage, two bracket halves that fill in round by
 * round toward it, spotlights, a perspective floor grid and rising gold sparks.
 * Pure SVG + CSS (no JS), so it renders on the server and loads instantly.
 */

const LEFT = ["Crimson", "Nightfall", "Aurora", "Iron Lotus"];
const RIGHT = ["Vanguard", "Eclipse", "Tempest", "Onyx"];

// Deterministic pseudo-random sparks (no hydration mismatch)
const SPARKS = Array.from({ length: 18 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 97.13 + n * 13.7) + 1) / 2);
  const f = (v: number) => Math.round(v * 100) / 100; // stable across server/client
  return {
    left: f(6 + r(1) * 88),
    size: f(1.5 + r(2) * 3),
    delay: f(r(3) * 9),
    dur: f(7 + r(4) * 8),
    drift: f((r(5) - 0.5) * 60),
    opacity: f(0.35 + r(6) * 0.6),
  };
});

type Side = "l" | "r";

/** One bracket half. x positions mirror for the right side. */
function BracketHalf({ side, teams }: { side: Side; teams: string[] }) {
  const m = (x: number) => (side === "l" ? x : 800 - x);
  const anchor = side === "l" ? "start" : "end";
  const rows = [150, 215, 300, 365]; // round-1 slot centres
  const semis = [182, 332];
  const finalY = 257;
  const boxW = 118;
  const boxX = (x: number) => (side === "l" ? x : 800 - x - boxW);
  const base = side === "l" ? 0 : 0.35; // stagger sides slightly

  // winners: index 0 of each pair, then semi 0
  return (
    <g>
      {/* round 1 slots */}
      {teams.map((t, i) => {
        const win = i % 2 === 0;
        return (
          <g key={t} className="la-fade" style={{ animationDelay: `${base + i * 0.12}s` }}>
            <rect x={boxX(40)} y={rows[i] - 15} width={boxW} height={30} rx={4} className={win ? "la-slot la-slot-win" : "la-slot"} style={{ animationDelay: `${1.4 + base}s` }} />
            <text x={m(side === "l" ? 54 : 54)} y={rows[i] + 4.5} textAnchor={anchor} className={win ? "la-team la-team-win" : "la-team"} style={{ animationDelay: `${1.4 + base}s` }}>
              {t}
            </text>
            <text x={m(side === "l" ? 146 : 146)} y={rows[i] + 4.5} textAnchor={side === "l" ? "end" : "start"} className="la-score" style={{ animationDelay: `${1.4 + base}s` }}>
              {win ? 2 : i === 1 ? 1 : 0}
            </text>
          </g>
        );
      })}

      {/* round 1 → semis connectors */}
      {[0, 1].map((p) => {
        const y1 = rows[p * 2];
        const y2 = rows[p * 2 + 1];
        const d = `M${m(158)} ${y1} H${m(185)} V${y2} H${m(158)} M${m(185)} ${semis[p]} H${m(215)}`;
        return <path key={p} d={d} className="la-line" style={{ animationDelay: `${0.7 + base + p * 0.15}s` }} />;
      })}

      {/* semi slots */}
      {semis.map((y, i) => (
        <g key={y} className="la-fade" style={{ animationDelay: `${1.2 + base + i * 0.1}s` }}>
          <rect x={boxX(215)} y={y - 15} width={boxW} height={30} rx={4} className={i === 0 ? "la-slot la-slot-win" : "la-slot"} style={{ animationDelay: `${2.6 + base}s` }} />
          <text x={m(229)} y={y + 4.5} textAnchor={anchor} className={i === 0 ? "la-team la-team-win" : "la-team"} style={{ animationDelay: `${2.6 + base}s` }}>
            {teams[i * 2]}
          </text>
          <text x={m(321)} y={y + 4.5} textAnchor={side === "l" ? "end" : "start"} className="la-score" style={{ animationDelay: `${2.6 + base}s` }}>
            {i === 0 ? 2 : 1}
          </text>
        </g>
      ))}

      {/* semis → final connector */}
      <path
        d={`M${m(333)} ${semis[0]} H${m(352)} V${semis[1]} H${m(333)} M${m(352)} ${finalY} H${m(372)}`}
        className="la-line la-line-gold"
        style={{ animationDelay: `${2.0 + base}s` }}
      />
    </g>
  );
}

export default function LoginArena({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={`login-arena overflow-hidden ${className || "relative h-full w-full"}`} aria-hidden>
      {/* Spotlights */}
      <div className="la-beam left-[18%] rotate-[18deg]" />
      <div className="la-beam left-[50%] -translate-x-1/2 [animation-delay:-3s]" />
      <div className="la-beam right-[18%] -rotate-[18deg] [animation-delay:-6s]" />

      {/* Crown glow */}
      <div className="absolute left-1/2 top-[30%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(242,193,78,0.28),rgba(242,193,78,0.05)_45%,transparent_70%)]" />

      {/* Perspective floor grid */}
      <div className="absolute inset-x-[-30%] bottom-0 h-[55%] [perspective:600px]">
        <div className="la-floor absolute inset-0 origin-bottom [transform:rotateX(62deg)]" />
      </div>

      {/* Bracket + trophy */}
      <svg viewBox="0 0 800 520" className={`absolute left-1/2 max-w-none -translate-x-1/2 ${compact ? "top-[-2%] w-[104%]" : "top-[11%] w-[84%]"}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="la-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFF1C2" />
            <stop offset="0.35" stopColor="#F2C14E" />
            <stop offset="0.75" stopColor="#C48A1C" />
            <stop offset="1" stopColor="#8A5E0E" />
          </linearGradient>
          <linearGradient id="la-gold-side" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8A5E0E" />
            <stop offset="0.45" stopColor="#F7D27A" />
            <stop offset="0.55" stopColor="#FFF1C2" />
            <stop offset="1" stopColor="#9A6A12" />
          </linearGradient>
          <linearGradient id="la-shine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <filter id="la-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="la-cup-clip">
            <path d="M352 150 H448 V176 C448 222 428 250 400 258 C372 250 352 222 352 176 Z" />
          </clipPath>
        </defs>

        <BracketHalf side="l" teams={LEFT} />
        <BracketHalf side="r" teams={RIGHT} />

        {/* Round labels */}
        {[
          { x: 99, t: "Quarterfinal" },
          { x: 274, t: "Semifinal" },
          { x: 526, t: "Semifinal" },
          { x: 701, t: "Quarterfinal" },
        ].map((l, i) => (
          <text key={i} x={l.x} y={112} textAnchor="middle" className="la-round">
            {l.t}
          </text>
        ))}

        {/* Trophy */}
        <g className="la-trophy" filter="url(#la-glow)">
          {/* handles */}
          <path d="M352 162 C322 162 318 206 352 214" fill="none" stroke="url(#la-gold-side)" strokeWidth="7" strokeLinecap="round" />
          <path d="M448 162 C478 162 482 206 448 214" fill="none" stroke="url(#la-gold-side)" strokeWidth="7" strokeLinecap="round" />
          {/* cup */}
          <path d="M352 150 H448 V176 C448 222 428 250 400 258 C372 250 352 222 352 176 Z" fill="url(#la-gold-side)" />
          <path d="M346 144 H454 V154 H346 Z" fill="url(#la-gold)" />
          {/* star emblem */}
          <path d="M400 178 l6.5 13 14.3 2.1 -10.4 10.1 2.5 14.2 -12.9 -6.8 -12.9 6.8 2.5 -14.2 -10.4 -10.1 14.3 -2.1z" fill="#8A5E0E" opacity="0.55" />
          {/* shine sweep */}
          <g clipPath="url(#la-cup-clip)">
            <rect x="300" y="140" width="40" height="130" fill="url(#la-shine)" className="la-shine" transform="skewX(-20)" />
          </g>
          {/* stem + base */}
          <path d="M392 258 H408 L412 290 H388 Z" fill="url(#la-gold-side)" />
          <path d="M378 290 H422 V300 H378 Z" fill="url(#la-gold)" />
          <path d="M366 300 H434 L440 322 H360 Z" fill="url(#la-gold-side)" />
          <rect x="374" y="306" width="52" height="9" rx="1.5" fill="#1a1205" opacity="0.6" />
          <text x="400" y="313.5" textAnchor="middle" className="la-plate">
            CHAMPION
          </text>
        </g>

        {/* Final label */}
        <text x="400" y="352" textAnchor="middle" className="la-final">
          Grand Final
        </text>
        <text x="400" y="372" textAnchor="middle" className="la-final-sub">
          Best of 5
        </text>
      </svg>

      {/* Rising sparks */}
      {SPARKS.map((s, i) => (
        <span
          key={i}
          className="la-spark"
          style={{
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animationDelay: `${-s.delay}s`,
            animationDuration: `${s.dur}s`,
            ["--drift" as string]: `${s.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
