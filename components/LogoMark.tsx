export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * (265 / 250)}
      viewBox="0 0 250 265"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="dGrad" x1="0.15" y1="0" x2="0.85" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#5BA4F5" />
          <stop offset="50%" stopColor="#2E72E6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>

      {/* ── Outer D shape (full blue) ── */}
      <path
        d="M 26,18 L 112,18
           C 228,18 244,80 244,133
           C 244,186 228,248 112,248
           L 26,248 Z"
        fill="url(#dGrad)"
      />

      {/* ── Inner belly cutout — creates the D ring effect ── */}
      <path
        d="M 80,66 L 112,66
           C 184,66 190,99 190,133
           C 190,167 184,200 112,200
           L 80,200 Z"
        fill="white"
      />

      {/* ── Dark navy spine (vertical bar with document lines) ── */}
      <rect x="26" y="66" width="58" height="134" rx="3" fill="#1B2A4A" />

      {/* ── White form lines ── */}
      <rect x="40" y="88"  width="32" height="7" rx="3.5" fill="white" opacity="0.92" />
      <rect x="40" y="110" width="32" height="7" rx="3.5" fill="white" opacity="0.92" />
      <rect x="40" y="132" width="26" height="7" rx="3.5" fill="white" opacity="0.92" />

      {/* ── Blue checkmark ── */}
      <path
        d="M 40,166 L 56,182 L 88,150"
        stroke="#4A96F5"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
