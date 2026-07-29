/**
 * doitforms mascot — smiling notepad (brand logo supplied by the owner,
 * recreated as inline SVG so it scales crisply everywhere).
 */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g transform="rotate(7 256 250)">
        {/* back page flaps */}
        <path
          d="M150 150 C120 210 118 290 138 350 L172 340 C154 285 156 215 178 160 Z"
          fill="#D9A85C"
          stroke="#4A2D16"
          strokeWidth="12"
          strokeLinejoin="round"
        />
        <path
          d="M185 145 C158 210 156 295 176 358 L208 348 C190 292 192 216 212 155 Z"
          fill="#E8C27C"
          stroke="#4A2D16"
          strokeWidth="12"
          strokeLinejoin="round"
        />
        {/* body */}
        <rect
          x="170"
          y="128"
          width="212"
          height="268"
          rx="30"
          fill="#F2CE8A"
          stroke="#4A2D16"
          strokeWidth="14"
        />
        {/* stacked bottom pages */}
        <path
          d="M182 388 q106 26 200 -6"
          stroke="#4A2D16"
          strokeWidth="9"
          fill="none"
          strokeLinecap="round"
        />
        {/* top roll (flipped cover) */}
        <path
          d="M150 132 q10 -44 62 -46 l150 -6 q52 0 56 38 q2 30 -36 34 l-196 10 q-34 2 -36 -30 z"
          fill="#EFC47F"
          stroke="#4A2D16"
          strokeWidth="14"
          strokeLinejoin="round"
        />
        <ellipse cx="352" cy="104" rx="26" ry="10" fill="#FBE7BC" />
        {/* eyes */}
        <ellipse cx="252" cy="240" rx="17" ry="24" fill="#3B2412" />
        <ellipse cx="318" cy="234" rx="17" ry="24" fill="#3B2412" />
        <circle cx="246" cy="230" r="6" fill="#fff" />
        <circle cx="312" cy="224" r="6" fill="#fff" />
        {/* mouth */}
        <path
          d="M232 292 q56 34 116 -8 q4 44 -34 62 q-44 20 -70 -12 q-14 -18 -12 -42 z"
          fill="#3B2412"
        />
        <path
          d="M238 290 l104 -7 l-4 22 l-98 8 z"
          fill="#fff"
        />
        <path
          d="M262 336 q26 16 52 -4 q-6 24 -28 24 q-20 0 -24 -20 z"
          fill="#E77C8F"
        />
      </g>
    </svg>
  );
}
