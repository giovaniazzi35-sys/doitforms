"use client";

import { useEffect, useRef, useState } from "react";
import type { TimerSettings, TimerPosition } from "@/lib/types";
import { getGoogleFontUrl } from "@/lib/themes";

export function CountdownTimer({ settings }: { settings: TimerSettings }) {
  const duration = Math.max(10, settings.durationSeconds ?? 600);
  const [remaining, setRemaining] = useState(duration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setRemaining(duration); }, [duration]);

  useEffect(() => {
    if (!settings.fontFamily) return;
    const url = getGoogleFontUrl(settings.fontFamily);
    if (!url) return;
    const id = `gf-timer-${settings.fontFamily.replace(/\s+/g, "-").toLowerCase()}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id; link.rel = "stylesheet"; link.href = url;
    document.head.appendChild(link);
  }, [settings.fontFamily]);

  useEffect(() => {
    if (!settings.enabled) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (settings.autoRestart) return duration;
          clearInterval(intervalRef.current!);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [settings.enabled, settings.autoRestart, duration]);

  if (!settings.enabled) return null;

  const position: TimerPosition = settings.position ?? "top";
  const isFloat = position !== "top";
  const urgencyThreshold = settings.urgencyThreshold ?? 60;
  const isUrgent = remaining > 0 && remaining <= urgencyThreshold;
  const expired = remaining === 0 && !settings.autoRestart;

  const bg = isUrgent
    ? (settings.urgencyBackgroundColor ?? "#dc2626")
    : (settings.backgroundColor ?? "#0f172a");
  const color = settings.color ?? "#ffffff";
  const fontFamily = settings.fontFamily ?? undefined;
  const fontSize = settings.fontSize ?? 20;
  const labelSize = Math.max(11, Math.round(fontSize * 0.72));
  const align = settings.align ?? (isFloat ? "center" : "left");
  const borderRadius = settings.borderRadius ?? (isFloat ? 12 : 0);

  const hours = Math.floor(remaining / 3600);
  const mins = Math.floor((remaining % 3600) / 60);
  const secs = remaining % 60;
  const timeStr = hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const justifyMap = { left: "flex-start", center: "center", right: "flex-end" } as const;
  const justifyContent = justifyMap[align];

  const floatPos = getFloatStyle(position);

  const wrapStyle: React.CSSProperties = isFloat
    ? {
        position: "fixed",
        zIndex: 50,
        ...floatPos,
        backgroundColor: bg,
        color,
        fontFamily,
        borderRadius,
        padding: "10px 18px",
        minWidth: 160,
        maxWidth: 340,
        transition: "background-color 0.5s",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }
    : {
        width: "100%",
        backgroundColor: bg,
        color,
        fontFamily,
        borderRadius,
        padding: "9px 20px",
        transition: "background-color 0.5s",
      };

  return (
    <div
      className={isUrgent ? "animate-urgency-pulse" : ""}
      style={wrapStyle}
      aria-live="polite"
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent, gap: 10, flexWrap: "wrap" }}>
        {settings.showLabel !== false && !expired && (
          <span style={{ fontSize: labelSize, fontWeight: 500, opacity: 0.85 }}>
            {settings.label || "⏰ Oferta expira em:"}
          </span>
        )}
        <span style={{ fontSize, fontWeight: 700, letterSpacing: "0.04em", fontVariantNumeric: "tabular-nums" }}>
          {expired ? "⏰ Oferta encerrada" : timeStr}
        </span>
      </div>
    </div>
  );
}

function getFloatStyle(position: TimerPosition): React.CSSProperties {
  switch (position) {
    case "float-tl": return { top: 16, left: 16 };
    case "float-tc": return { top: 16, left: "50%", transform: "translateX(-50%)" };
    case "float-tr": return { top: 16, right: 16 };
    case "float-bl": return { bottom: 16, left: 16 };
    case "float-bc": return { bottom: 16, left: "50%", transform: "translateX(-50%)" };
    case "float-br": return { bottom: 16, right: 16 };
    default: return {};
  }
}
