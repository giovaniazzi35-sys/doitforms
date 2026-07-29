import { LogoMark } from "./LogoMark";

export function Logo({
  className = "",
  mark = true,
  size = 30,
  subtitle = false,
  textClass = "text-[#4A2D16]",
}: {
  className?: string;
  mark?: boolean;
  size?: number;
  subtitle?: boolean;
  textClass?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {mark && <LogoMark size={size} />}
      <span className="flex flex-col leading-none">
        <span
          className={`text-xl font-extrabold uppercase tracking-tight ${textClass}`}
        >
          Doit&nbsp;Forms
        </span>
        {subtitle && (
          <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#6B4A2A]">
            Formulário traqueado
          </span>
        )}
      </span>
    </span>
  );
}
