"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { WalkerEngine } from "@/lib/walker/engine";

const PROGRESS_KEY = "walker-progress";

/** Progress is kept per browser tab, so switching language (or reloading) carries it over. */
function loadProgress(): { taken: number; opened: boolean } | undefined {
  try {
    const raw = sessionStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function saveProgress(p: { taken: number; opened: boolean }) {
  try {
    sessionStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    // storage unavailable (private mode etc.): progress just won't carry over
  }
}

/**
 * The stick figure layer. Mounted inside the #cv wrapper; tapping anywhere on the
 * page (except links and controls, or while selecting text) sends the walker there.
 * Collecting every star unlocks the chest; once the walker opens it, the page turns colourful.
 * The star counter stays in the corner; the unlock and thank-you messages appear briefly.
 */
export default function Playground({ labels }: { labels: Dictionary["play"] }) {
  const bgRef = useRef<HTMLCanvasElement>(null);
  const fgRef = useRef<HTMLCanvasElement>(null);
  const [stars, setStars] = useState({ taken: 0, total: 0 });
  const [toast, setToast] = useState<{ text: string; id: number } | null>(null);

  useEffect(() => {
    const root = document.getElementById("cv");
    const bg = bgRef.current;
    const fg = fgRef.current;
    if (!root || !bg || !fg || typeof ResizeObserver === "undefined") return;
    // no game in the PDF export (scripts/build-pdf.mjs opens the page with ?pdf) ...
    if (new URLSearchParams(window.location.search).has("pdf")) return;
    // ... and with reduced motion the figure just stands there: no counter, no clicks
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const initial = loadProgress();
    const progress = { taken: initial?.taken ?? 0, opened: initial?.opened ?? false };
    if (progress.opened) root.dataset.colored = "true";
    const show = (text: string) => setToast({ text, id: Date.now() });
    const engine = new WalkerEngine(root, bg, fg, {
      initial,
      onStars: still
        ? undefined
        : (taken, total) => {
            setStars({ taken, total });
            if (taken > progress.taken && taken >= total) show(labels.unlocked);
            progress.taken = taken;
            saveProgress(progress);
          },
      onChestOpened: () => {
        root.dataset.colored = "true"; // section rules take on colour too (see globals.css)
        progress.opened = true;
        saveProgress(progress);
        show(labels.thanks);
      },
    });
    engine.start();
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element).closest("a, button, input, label, select, textarea")) return;
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) return;
      engine.tap(e.clientX, e.clientY);
    };
    if (!still) root.addEventListener("click", onClick);
    return () => {
      root.removeEventListener("click", onClick);
      engine.destroy();
    };
  }, [labels]);

  return (
    <>
      <canvas ref={bgRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 h-full w-full" />
      <canvas ref={fgRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 h-full w-full" />
      {stars.total > 0 && (
        <div data-walker-ignore className="fixed top-3 right-4 z-50 font-mono text-[12px] text-muted">
          <span aria-label={`${labels.stars} ${stars.taken}/${stars.total}`}>
            ★ {stars.taken}/{stars.total}
          </span>
        </div>
      )}
      {toast && (
        <div data-walker-ignore className="pointer-events-none fixed inset-x-0 top-10 z-50 flex justify-center px-4">
          <p
            key={toast.id}
            role="status"
            className="walker-toast rounded-full border border-rule bg-ink/90 px-4 py-1.5 font-mono text-[12px] text-fg"
          >
            {toast.text}
          </p>
        </div>
      )}
    </>
  );
}
