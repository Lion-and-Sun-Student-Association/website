"use client";

import { Children, ReactNode, useEffect, useRef } from "react";

/**
 * Pins its slides to the centre of the viewport and cross-fades between them as
 * you scroll: the current slide fades out while the next fades in, in place —
 * the slides never move. Each child is one slide (e.g. a <Section>).
 *
 * How it works: a tall outer container provides the scroll distance (one
 * viewport per slide); a sticky stage stays locked to the viewport; the slides
 * are overlaid in the same spot, and scroll position drives their opacity.
 *
 * The fade is set on plain overlay wrappers (no backdrop-filter), so it
 * repaints reliably in Safari/Firefox and the inner glass blur stays intact
 * while a slide rests at full opacity.
 */
export default function CrossfadeStack({ children }: { children: ReactNode }) {
  const slides = Children.toArray(children);
  const n = slides.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ticking = false;

    const update = () => {
      ticking = false;
      const container = containerRef.current;
      if (!container) return;
      const vh = window.innerHeight;
      // How far we've scrolled into the stack, measured in viewports.
      // 0 → first slide centred; increases by 1 per viewport scrolled.
      const top = container.getBoundingClientRect().top;
      const progress = Math.min(Math.max(-top / vh, 0), n - 1);

      slideRefs.current.forEach((el, i) => {
        if (!el) return;
        let op: number;
        if (reduce) {
          // No cross-fade for reduced motion: hard-switch to the nearest slide.
          op = Math.round(progress) === i ? 1 : 0;
        } else {
          op = 1 - Math.min(Math.abs(progress - i), 1);
          if (op > 0.99) op = 1; // snap so the resting slide's blur is crisp
        }
        el.style.opacity = op === 1 ? "1" : op.toFixed(3);
        // Don't let a faded-out slide intercept clicks/hover.
        el.style.pointerEvents = op < 0.5 ? "none" : "auto";
      });
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, [n]);

  return (
    // Layout-critical positioning is set inline (not via Tailwind classes) so
    // it can't be missed by JIT class generation.
    <div ref={containerRef} style={{ position: "relative", height: `${n * 100}vh` }}>
      <div style={{ position: "sticky", top: 0, height: "100vh" }}>
        {slides.map((child, i) => (
          <div
            key={i}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: i === 0 ? 1 : 0,
            }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
