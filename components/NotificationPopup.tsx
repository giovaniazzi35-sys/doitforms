"use client";

import { useEffect, useRef, useState } from "react";
import type { PopupSettings } from "@/lib/types";

export function NotificationPopup({
  settings,
}: {
  settings: PopupSettings;
}) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const intervalMs = Math.max(5, settings.interval ?? 25) * 1000;
  const message = settings.message || "Alguém acabou de preencher este formulário! 🎉";
  const emoji = settings.emoji || "🔔";
  const author = settings.author || "";

  function show() {
    setVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), 5000);
  }

  useEffect(() => {
    if (dismissed || !settings.enabled) return;
    // First popup fires after half the interval (max 8s) so users see it quickly
    const firstDelay = Math.min(intervalMs / 2, 8000);
    const t1 = setTimeout(show, firstDelay);
    const t2 = setInterval(show, intervalMs);
    return () => {
      clearTimeout(t1);
      clearInterval(t2);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dismissed, settings.enabled, intervalMs]);

  if (!settings.enabled || dismissed || !visible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-4 right-4 z-50 max-w-[280px] animate-slide-right rounded-2xl bg-white px-4 py-3 shadow-2xl ring-1 ring-slate-200 sm:max-w-xs"
    >
      <button
        onClick={() => { setVisible(false); setDismissed(true); }}
        aria-label="Fechar"
        className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        ×
      </button>
      <div className="flex items-start gap-3 pr-4">
        <span className="mt-0.5 text-xl leading-none">{emoji}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug text-slate-800">
            {message}
          </p>
          {author && (
            <p className="mt-1 truncate text-xs text-slate-400">{author}</p>
          )}
        </div>
      </div>
    </div>
  );
}
