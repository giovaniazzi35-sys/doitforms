export function Logo({
  className = "",
  mark = true,
  textClass = "text-ink",
}: {
  className?: string;
  mark?: boolean;
  textClass?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold ${className}`}>
      {mark && (
        <svg
          width="28"
          height="28"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <rect width="32" height="32" rx="8" fill="url(#dg)" />
          <path
            d="M9 16.5l4.2 4.2L23 11"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="dg" x1="0" y1="0" x2="32" y2="32">
              <stop stopColor="#6366F1" />
              <stop offset="1" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </svg>
      )}
      <span className={`text-xl tracking-tight ${textClass}`}>
        doit<span className="brand-text-gradient">forms</span>
      </span>
    </span>
  );
}
