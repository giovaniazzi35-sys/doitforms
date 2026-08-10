import { LogoMark } from "./LogoMark";

export function Logo({
  className = "",
  mark = true,
  size = 30,
  subtitle = false,
  dark = false,
}: {
  className?: string;
  mark?: boolean;
  size?: number;
  subtitle?: boolean;
  /** Force white text (for dark backgrounds) */
  dark?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {mark && <LogoMark size={size} />}
      <span className="flex flex-col leading-none">
        <span className="flex items-baseline leading-none">
          <span
            className="font-extrabold tracking-tight"
            style={{ color: dark ? "#fff" : "#2563EB", fontSize: size * 0.8 }}
          >
            DOIT
          </span>
          <span
            className="font-extrabold tracking-tight"
            style={{ color: dark ? "#d1d5db" : "#0F172A", fontSize: size * 0.8 }}
          >
            FORMS
          </span>
        </span>
        {subtitle && (
          <span
            className="mt-1 font-semibold uppercase tracking-[0.22em]"
            style={{ fontSize: size * 0.26, color: dark ? "#9ca3af" : "#64748b" }}
          >
            Formulários • Simples • Inteligentes
          </span>
        )}
      </span>
    </span>
  );
}
