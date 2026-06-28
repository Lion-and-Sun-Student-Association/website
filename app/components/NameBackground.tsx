"use client";

import { useEffect, useRef, useState } from "react";
import type { NameEntry } from "@/lib/getNames";
import { defaultLocale, type Locale } from "@/i18n/config";

interface Token {
  id: number;
  name: string;
  x: number; // px, top-left within container
  y: number;
  fontSize: number;
  duration: number; // ms
}

const SPAWN_INTERVAL = 200; // ms between spawn attempts
const MAX_ACTIVE = 14; // cap concurrent names
const PLACEMENT_ATTEMPTS = 40; // random tries before giving up this cycle
const GAP = 28; // min px gap enforced between names

// Rough bounding box for a name at a given size (handwriting font ≈ 0.5 ratio).
function estimate(name: string, fontSize: number) {
  return { w: name.length * fontSize * 0.5, h: fontSize * 1.3 };
}

interface NameBackgroundProps {
  names: NameEntry[];
  locale?: Locale;
  /**
   * When true, names stay hidden until the visitor scrolls past the hero
   * (used on the home page). When false they appear immediately.
   */
  gateScroll?: boolean;
}

export default function NameBackground({
  names,
  locale = defaultLocale,
  gateScroll = false,
}: NameBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [active, setActive] = useState(false);
  const tokensRef = useRef<Token[]>([]);
  const idRef = useRef(0);

  // Mirror state into a ref so the spawn loop reads live positions, not a stale closure.
  useEffect(() => {
    tokensRef.current = tokens;
  }, [tokens]);

  // Decide when the names start spawning. Off the home page they're active
  // immediately; on the home page we wait until the hero is scrolled past.
  useEffect(() => {
    if (!gateScroll) {
      setActive(true);
      return;
    }
    // Toggle both ways: names appear once the hero is scrolled past and
    // disappear again if the visitor scrolls back up into it.
    const onScroll = () => {
      setActive(window.scrollY >= window.innerHeight * 0.7);
    };
    onScroll(); // handle a page that loads already scrolled down
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [gateScroll]);

  useEffect(() => {
    if (!active) return;
    if (names.length === 0) return;
    // Skip on mobile (< 768px) — too small to read and hurts performance.
    if (window.matchMedia("(max-width: 767px)").matches) return;
    // Respect users who prefer reduced motion — don't animate at all.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Pick the name in the active language, falling back to English.
    const pickName = () => {
      const entry = names[Math.floor(Math.random() * names.length)];
      return entry[locale] || entry.en;
    };

    const overlaps = (x: number, y: number, w: number, h: number) =>
      tokensRef.current.some((t) => {
        const { w: tw, h: th } = estimate(t.name, t.fontSize);
        return !(
          x + w + GAP < t.x ||
          x > t.x + tw + GAP ||
          y + h + GAP < t.y ||
          y > t.y + th + GAP
        );
      });

    const spawn = () => {
      const el = containerRef.current;
      if (!el || tokensRef.current.length >= MAX_ACTIVE) return;

      const cw = el.clientWidth;
      const ch = el.clientHeight;
      const name = pickName();
      const fontSize = 16 + Math.random() * 26; // 16–42px
      const { w, h } = estimate(name, fontSize);

      for (let i = 0; i < PLACEMENT_ATTEMPTS; i++) {
        const x = Math.random() * Math.max(0, cw - w);
        const y = Math.random() * Math.max(0, ch - h);
        if (!overlaps(x, y, w, h)) {
          const id = idRef.current++;
          const duration = 7000 + Math.random() * 4000; // 7–11s lifespan
          setTokens((prev) => [...prev, { id, name, x, y, fontSize, duration }]);
          return;
        }
      }
    };

    const interval = setInterval(spawn, SPAWN_INTERVAL);
    return () => clearInterval(interval);
  }, [active, names, locale]);

  const remove = (id: number) =>
    setTokens((prev) => prev.filter((t) => t.id !== id));

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{ opacity: active ? 1 : 0, transition: "opacity 0.8s ease" }}
    >
      {tokens.map((t) => (
        <span
          key={t.id}
          onAnimationEnd={() => remove(t.id)}
          className="name-token"
          style={{
            left: t.x,
            top: t.y,
            fontSize: t.fontSize,
            animationDuration: `${t.duration}ms`,
          }}
        >
          {t.name}
        </span>
      ))}
    </div>
  );
}
