"use client";

import { useEffect, useRef, useState } from "react";
import type { TimerSettings } from "@/lib/types";

export function CountdownTimer({ settings }: { settings: TimerSettings }) {
  const duration = Math.max(10, settings.durationSeconds ?? 600);
  const [remaining, setRemaining] = useState(duration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // reset when duration changes (e.g. editor live-preview)
  useEffect(() => {
    setRemaining(duration);
  }, [duration]);

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

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [settings.enabled, settings.autoRestart, duration]);

  if (!settings.enabled) return null;

  const urgencyThreshold = settings.urgencyThreshold ?? 60;
  const isUrgent = remaining > 0 && remaining <= urgencyThreshold;
  const expired = remaining === 0 && !settings.autoRestart;

  const bg = isUrgent
    ? (settings.urgencyBackgroundColor ?? "#dc2626")
    : (settings.backgroundColor ?? "#0f172a");
  const color = settings.color ?? "#ffffff";

  const hours = Math.floor(remaining / 3600);
  const mins = Math.floor((remaining % 3600) / 60);
  const secs = remaining % 60;
  const timeStr =
    hours > 0
      ? `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
      : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const fsClass =
    settings.fontSize === "lg"
      ? "text-lg"
      : settings.fontSize === "sm"
        ? "text-sm"
        : "text-base";

  const clockFsClass =
    settings.fontSize === "lg"
      ? "text-2xl"
      : settings.fontSize === "sm"
        ? "text-base"
        : "text-xl";

  return (
    <div
      className={`flex w-full items-center justify-between px-5 py-2.5 transition-colors duration-500${isUrgent ? " animate-urgency-pulse" : ""}`}
      style={{ backgroundColor: bg, color }}
      aria-live="polite"
    >
      <span className={`font-medium ${fsClass}`}>
        {expired ? "⏰ Oferta encerrada" : (settings.label || "⏰ Oferta expira em:")}
      </span>
      {!expired && (
        <span className={`font-mono font-bold tabular-nums ${clockFsClass}`}>
          {timeStr}
        </span>
      )}
    </div>
  );
}
