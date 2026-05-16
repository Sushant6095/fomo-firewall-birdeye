import * as React from "react";

type LogoProps = {
  size?: number;
  className?: string;
  glow?: boolean;
};

/* ──────────────────────────────────────────────────────────────────────
 * LOGO A — Shield Sentinel (original mark, recolored to emerald theme)
 * ────────────────────────────────────────────────────────────────────── */

export function LogoMark({ size = 32, className = "", glow = false }: LogoProps) {
  const id = React.useId();
  const gStroke = `${id}-stroke`;
  const gFill = `${id}-fill`;
  const gScan = `${id}-scan`;
  const fGlow = `${id}-glow`;
  const cShield = `${id}-clip`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      role="img"
      aria-label="FOMO Firewall"
      className={className}
      style={glow ? { filter: "drop-shadow(0 0 14px rgba(16,185,129,0.45))" } : undefined}
    >
      <defs>
        <linearGradient id={gStroke} x1="20" y1="20" x2="236" y2="236" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#84CC16" />
          <stop offset="55%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <linearGradient id={gFill} x1="0" y1="0" x2="0" y2="256" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F1A14" />
          <stop offset="100%" stopColor="#050D09" />
        </linearGradient>
        <linearGradient id={gScan} x1="20" y1="236" x2="236" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0" />
          <stop offset="50%" stopColor="#10B981" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#84CC16" stopOpacity="0" />
        </linearGradient>
        <filter id={fGlow} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id={cShield}>
          <path d="M128 12 L228 64 L228 192 L128 244 L28 192 L28 64 Z" />
        </clipPath>
      </defs>
      <path d="M128 12 L228 64 L228 192 L128 244 L28 192 L28 64 Z" fill={`url(#${gFill})`} />
      <path
        d="M128 12 L228 64 L228 192 L128 244 L28 192 L28 64 Z"
        stroke={`url(#${gStroke})`}
        strokeWidth="4"
        strokeLinejoin="miter"
        fill="none"
      />
      <g clipPath={`url(#${cShield})`}>
        <g opacity="0.18">
          <line x1="40" y1="92" x2="216" y2="92" stroke="#10B981" strokeWidth="1" strokeDasharray="2 4" />
          <line x1="40" y1="128" x2="216" y2="128" stroke="#84CC16" strokeWidth="1" strokeDasharray="2 4" />
          <line x1="40" y1="164" x2="216" y2="164" stroke="#EF4444" strokeWidth="1" strokeDasharray="2 4" />
        </g>
        <line x1="20" y1="236" x2="236" y2="20" stroke={`url(#${gScan})`} strokeWidth="2" />
        <g filter={`url(#${fGlow})`}>
          <rect x="76" y="76" width="14" height="104" fill="#E8F5E9" />
          <polygon points="76,76 180,76 168,90 90,90" fill="#E8F5E9" />
          <polygon points="76,124 156,124 144,138 90,138" fill="#E8F5E9" />
        </g>
        {/* Trap dot stays red — that's the threat being caught */}
        <circle cx="196" cy="76" r="6" fill="#EF4444" />
        <circle cx="196" cy="76" r="10" fill="none" stroke="#EF4444" strokeOpacity="0.4" strokeWidth="1" />
      </g>
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * LOGO B — Hex Sentinel (hexagonal circuit-board mark)
 * Premium "intelligence chip" aesthetic. PCB trace lines route inward.
 * ────────────────────────────────────────────────────────────────────── */

export function LogoHex({ size = 32, className = "", glow = false }: LogoProps) {
  const id = React.useId();
  const gStroke = `${id}-stroke`;
  const gFill = `${id}-fill`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      role="img"
      aria-label="FOMO Firewall — Hex Sentinel"
      className={className}
      style={glow ? { filter: "drop-shadow(0 0 16px rgba(132,204,22,0.45))" } : undefined}
    >
      <defs>
        <linearGradient id={gStroke} x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A3E635" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#065F46" />
        </linearGradient>
        <linearGradient id={gFill} x1="0" y1="0" x2="0" y2="256" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F1A14" />
          <stop offset="100%" stopColor="#050D09" />
        </linearGradient>
      </defs>

      {/* Outer hex shell */}
      <polygon
        points="128,12 228,72 228,184 128,244 28,184 28,72"
        fill={`url(#${gFill})`}
        stroke={`url(#${gStroke})`}
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Inner hex ring */}
      <polygon
        points="128,36 208,84 208,172 128,220 48,172 48,84"
        fill="none"
        stroke="#10B981"
        strokeOpacity="0.25"
        strokeWidth="1"
      />

      {/* PCB trace lines routing from edges to center pad */}
      <g stroke="#34D399" strokeOpacity="0.55" strokeWidth="1.5" fill="none" strokeLinecap="round">
        <path d="M28 72 L80 100 L116 100" />
        <path d="M228 72 L176 100 L140 100" />
        <path d="M128 12 L128 60 L128 100" />
        <path d="M28 184 L80 156 L116 156" />
        <path d="M228 184 L176 156 L140 156" />
        <path d="M128 244 L128 200 L128 156" />
      </g>

      {/* Solder pads at trace endpoints */}
      <g fill="#84CC16">
        <circle cx="28" cy="72" r="3" />
        <circle cx="228" cy="72" r="3" />
        <circle cx="128" cy="12" r="3" />
        <circle cx="28" cy="184" r="3" />
        <circle cx="228" cy="184" r="3" />
        <circle cx="128" cy="244" r="3" />
      </g>

      {/* Center chip pad with FF monogram */}
      <rect x="100" y="92" width="56" height="72" rx="4" fill="#050D09" stroke="#10B981" strokeWidth="1.5" />
      <text
        x="128"
        y="138"
        textAnchor="middle"
        fill="#34D399"
        fontFamily="'SF Mono', Menlo, monospace"
        fontSize="28"
        fontWeight="800"
        letterSpacing="-1"
      >
        FF
      </text>

      {/* Subtle activity dot — bottom right corner of chip */}
      <circle cx="150" cy="158" r="2" fill="#A3E635">
        <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * LOGO C — Pulse Shield (radar / pulse mark, no letters)
 * Concentric arcs + centered chevron. Says "live detection" in a glance.
 * ────────────────────────────────────────────────────────────────────── */

export function LogoPulse({ size = 32, className = "", glow = false }: LogoProps) {
  const id = React.useId();
  const gStroke = `${id}-stroke`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      role="img"
      aria-label="FOMO Firewall — Pulse Shield"
      className={className}
      style={glow ? { filter: "drop-shadow(0 0 18px rgba(16,185,129,0.55))" } : undefined}
    >
      <defs>
        <linearGradient id={gStroke} x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A3E635" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="128" cy="128" r="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background glow */}
      <circle cx="128" cy="128" r="120" fill={`url(#${id}-glow)`} />

      {/* Concentric radar arcs */}
      <g fill="none" stroke="#10B981" strokeLinecap="round">
        <circle cx="128" cy="128" r="116" strokeOpacity="0.85" strokeWidth="3" />
        <circle cx="128" cy="128" r="88"  strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="3 5" />
        <circle cx="128" cy="128" r="62"  strokeOpacity="0.30" strokeWidth="1" strokeDasharray="2 4" />
      </g>

      {/* Sweeping radar wedge (animated rotation) */}
      <g style={{ transformOrigin: "128px 128px" }}>
        <path
          d="M128 128 L128 12 A116 116 0 0 1 232 96 Z"
          fill={`url(#${gStroke})`}
          opacity="0.18"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 128 128"
            to="360 128 128"
            dur="6s"
            repeatCount="indefinite"
          />
        </path>
      </g>

      {/* Chevron F monogram, centered */}
      <g fill="#E8F5E9">
        {/* Vertical bar */}
        <rect x="94" y="76" width="14" height="104" rx="2" />
        {/* Top horizontal — angled cut */}
        <polygon points="94,76 174,76 162,92 108,92" />
        {/* Middle horizontal */}
        <polygon points="94,118 154,118 142,134 108,134" />
      </g>

      {/* Detection ping — pulsing dot at top of radar */}
      <circle cx="128" cy="20" r="6" fill="#EF4444">
        <animate attributeName="r" values="6;9;6" dur="1.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.5;1" dur="1.6s" repeatCount="indefinite" />
      </circle>
      <circle cx="128" cy="20" r="3" fill="#FFFFFF" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Wordmark lockup (uses primary mark + Apple-weight type)
 * ────────────────────────────────────────────────────────────────────── */

export function LogoWordmark({
  size = 32,
  className = "",
  tagline = false,
  variant = "pulse"
}: LogoProps & { tagline?: boolean; variant?: "shield" | "hex" | "pulse" }) {
  const Mark = variant === "hex" ? LogoHex : variant === "shield" ? LogoMark : LogoPulse;
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Mark size={size} />
      <span className="flex flex-col leading-none">
        <span
          className="font-display-lg font-black uppercase tracking-tight text-on-surface"
          style={{ fontSize: `${size * 0.625}px`, letterSpacing: "-0.04em" }}
        >
          FOMO Firewall
        </span>
        {tagline ? (
          <span
            className="font-mono-label uppercase text-primary"
            style={{
              fontSize: `${size * 0.22}px`,
              letterSpacing: "0.3em",
              marginTop: `${size * 0.08}px`
            }}
          >
            Exit-Liquidity Terminal
          </span>
        ) : null}
      </span>
    </span>
  );
}
