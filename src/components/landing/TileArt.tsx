/**
 * Coded gold-on-obsidian artwork for the landing category tiles.
 * Pure SVG + CSS so every tile matches the brand and loads instantly.
 */

type Variant = "tournaments" | "scrims" | "squads" | "leaderboard" | "feed" | "dashboard";

const GOLD = "#F2C14E";

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFF1C2" />
        <stop offset="0.45" stopColor="#F2C14E" />
        <stop offset="1" stopColor="#9A6A12" />
      </linearGradient>
      <linearGradient id={`${id}-side`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#8A5E0E" />
        <stop offset="0.5" stopColor="#FFE8A3" />
        <stop offset="1" stopColor="#9A6A12" />
      </linearGradient>
      <radialGradient id={`${id}-glow`} cx="0.5" cy="0.45" r="0.6">
        <stop offset="0" stopColor="#F2C14E" stopOpacity="0.35" />
        <stop offset="1" stopColor="#F2C14E" stopOpacity="0" />
      </radialGradient>
      <pattern id={`${id}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M20 0H0V20" fill="none" stroke="rgba(242,193,78,0.07)" strokeWidth="1" />
      </pattern>
      <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

function Frame({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 320 200" className="tile-art absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <Defs id={id} />
      <rect width="320" height="200" fill="#09090c" />
      <rect width="320" height="200" fill={`url(#${id}-grid)`} />
      <rect width="320" height="200" fill={`url(#${id}-glow)`} />
      {/* diagonal gold slash */}
      <path d="M232 0 L246 0 L176 200 L162 200 Z" fill="rgba(242,193,78,0.06)" />
      <path d="M252 0 L254 0 L184 200 L182 200 Z" fill="rgba(242,193,78,0.35)" />
      {children}
    </svg>
  );
}

const label = {
  fontFamily: "var(--font-rajdhani), system-ui, sans-serif",
  fontWeight: 700,
  letterSpacing: "0.12em",
} as const;

export default function TileArt({ variant }: { variant: Variant }) {
  const id = `ta-${variant}`;

  if (variant === "tournaments") {
    return (
      <Frame id={id}>
        {/* bracket lines converging on a trophy */}
        <g fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" className="ta-draw">
          <path d="M40 50 H70 V80 H40 M70 65 H95" />
          <path d="M40 120 H70 V150 H40 M70 135 H95" />
          <path d="M280 50 H250 V80 H280 M250 65 H225" />
          <path d="M280 120 H250 V150 H280 M250 135 H225" />
        </g>
        <g fill="none" stroke={GOLD} strokeWidth="1.5" className="ta-draw ta-delay">
          <path d="M95 65 H110 V135 H95 M110 100 H128" />
          <path d="M225 65 H210 V135 H225 M210 100 H192" />
        </g>
        {[50, 80, 120, 150].map((y) => (
          <g key={y}>
            <rect x="14" y={y - 7} width="26" height="14" rx="2" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" />
            <rect x="280" y={y - 7} width="26" height="14" rx="2" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" />
          </g>
        ))}
        <g filter={`url(#${id}-blur)`} className="ta-float">
          <path d="M140 72 C122 72 120 98 140 102" fill="none" stroke={`url(#${id}-side)`} strokeWidth="5" strokeLinecap="round" />
          <path d="M180 72 C198 72 200 98 180 102" fill="none" stroke={`url(#${id}-side)`} strokeWidth="5" strokeLinecap="round" />
          <path d="M140 66 H180 V80 C180 104 170 116 160 120 C150 116 140 104 140 80 Z" fill={`url(#${id}-side)`} />
          <rect x="156" y="120" width="8" height="14" fill={`url(#${id}-g)`} />
          <path d="M146 134 H174 L178 146 H142 Z" fill={`url(#${id}-side)`} />
          <path d="M160 82 l3.5 7 7.7 1.1 -5.6 5.4 1.3 7.6 -6.9 -3.6 -6.9 3.6 1.3 -7.6 -5.6 -5.4 7.7 -1.1z" fill="#7a520c" opacity="0.6" />
        </g>
        <text x="160" y="172" textAnchor="middle" fontSize="10" fill={GOLD} style={label}>GRAND FINAL</text>
      </Frame>
    );
  }

  if (variant === "scrims") {
    return (
      <Frame id={id}>
        {/* two team shields + VS + crossed blades */}
        {[{ x: 70, n: "CRV", s: "2" }, { x: 250, n: "NFL", s: "1" }].map((t, i) => (
          <g key={t.n} className={i === 0 ? "ta-slide-l" : "ta-slide-r"}>
            <path d={`M${t.x - 32} 52 H${t.x + 32} V100 C${t.x + 32} 124 ${t.x + 14} 138 ${t.x} 144 C${t.x - 14} 138 ${t.x - 32} 124 ${t.x - 32} 100 Z`} fill="rgba(255,255,255,0.04)" stroke={i === 0 ? GOLD : "rgba(255,255,255,0.25)"} strokeWidth="1.5" />
            <text x={t.x} y="98" textAnchor="middle" fontSize="18" fill={i === 0 ? "#FFF1C2" : "#a9a6b2"} style={label}>{t.n}</text>
            <text x={t.x} y="128" textAnchor="middle" fontSize="22" fill={i === 0 ? GOLD : "#6f6c78"} style={label}>{t.s}</text>
          </g>
        ))}
        <g filter={`url(#${id}-blur)`} className="ta-pulse">
          <path d="M132 60 L188 140 M188 60 L132 140" stroke={`url(#${id}-g)`} strokeWidth="5" strokeLinecap="round" />
          <path d="M128 56 l10 0 0 10 M192 56 l-10 0 0 10" stroke={GOLD} strokeWidth="3" fill="none" />
        </g>
        <text x="160" y="106" textAnchor="middle" fontSize="26" fill="#fff" style={{ ...label, letterSpacing: "0.05em" }}>VS</text>
        <text x="160" y="176" textAnchor="middle" fontSize="10" fill={GOLD} style={label}>BEST OF 3 · DRAFT PICK</text>
      </Frame>
    );
  }

  if (variant === "squads") {
    const roles = ["TANK", "FIGHT", "JUNG", "MAGE", "MM"];
    const pts = roles.map((_, i) => {
      const a = (-90 + i * 72) * (Math.PI / 180);
      return { x: Math.round(160 + Math.cos(a) * 62), y: Math.round(100 + Math.sin(a) * 62) };
    });
    return (
      <Frame id={id}>
        <polygon points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="rgba(242,193,78,0.06)" stroke="rgba(242,193,78,0.35)" strokeWidth="1.5" className="ta-spin-slow" style={{ transformOrigin: "160px 100px" }} />
        {pts.map((p, i) => (
          <line key={i} x1="160" y1="100" x2={p.x} y2={p.y} stroke="rgba(242,193,78,0.25)" strokeDasharray="3 4" />
        ))}
        <g filter={`url(#${id}-blur)`}>
          <circle cx="160" cy="100" r="16" fill={`url(#${id}-g)`} />
          <text x="160" y="104.5" textAnchor="middle" fontSize="11" fill="#1a1205" style={label}>5</text>
        </g>
        {pts.map((p, i) => (
          <g key={roles[i]} className="ta-pop" style={{ animationDelay: `${i * 0.15}s` }}>
            <polygon
              points={[0, 1, 2, 3, 4, 5].map((k) => { const a = (k * 60 - 90) * (Math.PI / 180); return `${(p.x + Math.cos(a) * 17).toFixed(1)},${(p.y + Math.sin(a) * 17).toFixed(1)}`; }).join(" ")}
              fill="#0e0e13"
              stroke={GOLD}
              strokeWidth="1.5"
            />
            <text x={p.x} y={p.y + 3.5} textAnchor="middle" fontSize="8" fill="#FFE8A3" style={label}>{roles[i]}</text>
          </g>
        ))}
      </Frame>
    );
  }

  if (variant === "leaderboard") {
    const bars = [
      { x: 92, h: 56, n: "2", c: "rgba(203,213,225,0.35)" },
      { x: 140, h: 84, n: "1", c: GOLD },
      { x: 188, h: 40, n: "3", c: "rgba(180,110,40,0.55)" },
    ];
    return (
      <Frame id={id}>
        {/* spotlight */}
        <path d="M150 0 L170 0 L215 170 L105 170 Z" fill="rgba(255,236,180,0.06)" />
        {bars.map((b, i) => (
          <g key={b.n} className="ta-rise" style={{ animationDelay: `${i * 0.12}s` }}>
            <rect x={b.x} y={170 - b.h} width="40" height={b.h} rx="3" fill={b.n === "1" ? `url(#${id}-g)` : "rgba(255,255,255,0.05)"} stroke={b.c} strokeWidth="1.5" />
            <text x={b.x + 20} y={170 - b.h + 24} textAnchor="middle" fontSize="20" fill={b.n === "1" ? "#1a1205" : "#e7e5df"} style={label}>{b.n}</text>
          </g>
        ))}
        <g filter={`url(#${id}-blur)`} className="ta-float">
          <path d="M146 72 L150 56 L157 66 L160 52 L163 66 L170 56 L174 72 Z" fill={`url(#${id}-g)`} />
        </g>
        <line x1="70" y1="170" x2="250" y2="170" stroke="rgba(242,193,78,0.4)" />
        <text x="160" y="188" textAnchor="middle" fontSize="10" fill={GOLD} style={label}>SEASON 4 RANKINGS</text>
      </Frame>
    );
  }

  if (variant === "feed") {
    const posts = [
      { y: 34, w: 150, name: "Rook", r: "🔥 24" },
      { y: 84, w: 120, name: "Vexa", r: "⚡ 18" },
      { y: 134, w: 160, name: "Kairo", r: "👑 41" },
    ];
    return (
      <Frame id={id}>
        {posts.map((p, i) => (
          <g key={p.name} className="ta-slide-up" style={{ animationDelay: `${i * 0.15}s` }}>
            <rect x={60 + i * 6} y={p.y} width="200" height="40" rx="8" fill="rgba(14,14,19,0.95)" stroke={i === 1 ? GOLD : "rgba(255,255,255,0.12)"} />
            <circle cx={80 + i * 6} cy={p.y + 20} r="10" fill={i === 1 ? `url(#${id}-g)` : "rgba(255,255,255,0.08)"} stroke="rgba(242,193,78,0.4)" />
            <text x={96 + i * 6} y={p.y + 16} fontSize="9" fill="#FFE8A3" style={label}>{p.name.toUpperCase()}</text>
            <rect x={96 + i * 6} y={p.y + 22} width={p.w - 40} height="4" rx="2" fill="rgba(255,255,255,0.14)" />
            <rect x={96 + i * 6} y={p.y + 29} width={(p.w - 40) * 0.6} height="4" rx="2" fill="rgba(255,255,255,0.08)" />
            <text x={248 + i * 6} y={p.y + 24} textAnchor="end" fontSize="9" fill="#a9a6b2">{p.r}</text>
          </g>
        ))}
      </Frame>
    );
  }

  // dashboard
  const vals = [38, 62, 48, 80, 66, 96];
  return (
    <Frame id={id}>
      <rect x="34" y="26" width="252" height="148" rx="10" fill="rgba(14,14,19,0.9)" stroke="rgba(255,255,255,0.1)" />
      <text x="50" y="48" fontSize="10" fill="#a9a6b2" style={label}>SCRIM RECORD</text>
      <text x="270" y="50" textAnchor="end" fontSize="18" fill={GOLD} style={label}>12–4</text>
      {vals.map((v, i) => (
        <rect key={i} className="ta-rise" style={{ animationDelay: `${i * 0.08}s` }} x={56 + i * 36} y={160 - v} width="20" height={v} rx="3" fill={i === vals.length - 1 ? `url(#${id}-g)` : "rgba(242,193,78,0.22)"} />
      ))}
      <polyline points={vals.map((v, i) => `${66 + i * 36},${152 - v}`).join(" ")} fill="none" stroke="#FFE8A3" strokeWidth="2" className="ta-draw" />
      {vals.map((v, i) => (
        <circle key={i} cx={66 + i * 36} cy={152 - v} r="3" fill="#FFE8A3" />
      ))}
    </Frame>
  );
}
