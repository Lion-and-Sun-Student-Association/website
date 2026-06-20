"use client";

import { useEffect, useState } from "react";
import Collage from "@/app/components/Home/Collage";
import type { Slide } from "@/app/components/Home/hero.config";

/**
 * Crossfades through a list of slides (each a collage of 1–4 images). All
 * slides are stacked; only the active one is at full opacity, and a CSS opacity
 * transition produces the fade. Pauses for reduced-motion users.
 */
export default function HeroSlideshow({
  slides,
  intervalMs = 6000,
}: {
  slides: Slide[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      intervalMs
    );
    return () => clearInterval(id);
  }, [slides.length, intervalMs]);

  return (
    <>
      {slides.map((slide, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            opacity: i === index ? 1 : 0,
            transition: "opacity 1.5s ease-in-out",
          }}
        >
          <Collage slide={slide} eager={i === 0} />
        </div>
      ))}
    </>
  );
}
