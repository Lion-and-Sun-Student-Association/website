"use client";

import { useEffect, useRef } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Delay before the reveal starts, in ms. */
  delay?: number;
  /** Initial vertical offset in px (element slides up into place). */
  y?: number;
}

/**
 * Wraps content in the `.scroll-reveal` styling and toggles `.scroll-revealed`
 * (defined in globals.css) once the element scrolls into view — an in-place
 * fade + slide-up. Reveals once, then stops observing.
 */
export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  y = 24,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Honor reduced-motion: show immediately, no animation.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("scroll-revealed");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("scroll-revealed");
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${className}`}
      style={{ transform: `translateY(${y}px)`, transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
