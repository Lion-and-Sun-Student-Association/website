"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { FocalImage, Slide } from "@/app/components/Home/hero.config";

/** Image rectangles (in %) per image count. Adjacent rects OVERLAP (see the
 *  44/56 split → 12% overlap) so the feathered inner edges of neighbours cross
 *  over each other and blend, rather than leaving a hard seam or a dark gap. */
type Rect = { left: number; top: number; width: number; height: number };
type Edge = "left" | "right" | "top" | "bottom";

const LAYOUTS: Record<number, Rect[]> = {
  1: [{ left: 0, top: 0, width: 100, height: 100 }],
  2: [
    { left: 0, top: 0, width: 56, height: 100 },
    { left: 44, top: 0, width: 56, height: 100 },
  ],
  3: [
    { left: 0, top: 0, width: 56, height: 100 }, // tall left
    { left: 44, top: 0, width: 56, height: 56 }, // top right
    { left: 44, top: 44, width: 56, height: 56 }, // bottom right
  ],
  4: [
    { left: 0, top: 0, width: 56, height: 56 },
    { left: 44, top: 0, width: 56, height: 56 },
    { left: 0, top: 44, width: 56, height: 56 },
    { left: 44, top: 44, width: 56, height: 56 },
  ],
};

/** Which edges of each image are internal (touch a neighbour) and so get
 *  feathered. Outer edges stay crisp. Parallel to LAYOUTS. */
const FEATHER_EDGES: Record<number, Edge[][]> = {
  1: [[]],
  2: [["right"], ["left"]],
  3: [["right"], ["left", "bottom"], ["left", "top"]],
  4: [
    ["right", "bottom"],
    ["left", "bottom"],
    ["right", "top"],
    ["left", "top"],
  ],
};

/** How far the fade reaches in from a feathered edge (% of that image). Tuned
 *  to roughly match the 12% layout overlap so neighbours cross-fade cleanly. */
const FEATHER = "22%";

const EDGE_GRADIENT: Record<Edge, string> = {
  left: `linear-gradient(to right, transparent, #000 ${FEATHER})`,
  right: `linear-gradient(to left, transparent, #000 ${FEATHER})`,
  top: `linear-gradient(to bottom, transparent, #000 ${FEATHER})`,
  bottom: `linear-gradient(to top, transparent, #000 ${FEATHER})`,
};

/** Build the mask style for an image given which edges to feather. Multiple
 *  edges are combined with `intersect` so every feathered edge fades (the alpha
 *  is the min across layers). Standard + -webkit- for cross-browser support. */
function featherStyle(edges: Edge[]): React.CSSProperties {
  if (edges.length === 0) return {};
  const mask = edges.map((e) => EDGE_GRADIENT[e]).join(", ");
  return {
    maskImage: mask,
    WebkitMaskImage: mask,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskSize: "100% 100%",
    WebkitMaskSize: "100% 100%",
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
  } as React.CSSProperties;
}

function objectPosition(focal?: FocalImage["focal"]) {
  const x = (focal?.x ?? 0.5) * 100;
  const y = (focal?.y ?? 0.5) * 100;
  return `${x}% ${y}%`;
}

/**
 * One slide: a collage of 1–4 images on desktop, collapsing to just the
 * primary image (full-bleed) on mobile. Each image is cropped with
 * object-position set from its focal point so the subject is never cut off.
 */
export default function Collage({
  slide,
  eager = false,
}: {
  slide: Slide;
  eager?: boolean;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const images = slide.images.slice(0, 4);
  if (images.length === 0) return null;

  // Mobile: primary image only, full-bleed (no feather — it fills the frame).
  if (isMobile) {
    const img = images[0];
    return (
      <Image
        src={img.src}
        alt={img.alt ?? ""}
        fill
        priority={eager}
        sizes="100vw"
        style={{ objectFit: "cover", objectPosition: objectPosition(img.focal) }}
      />
    );
  }

  const count = images.length;
  const layout = LAYOUTS[count] ?? LAYOUTS[1];
  const edgesPerImage = FEATHER_EDGES[count] ?? FEATHER_EDGES[1];

  return (
    <>
      {images.map((img, i) => {
        const r = layout[i];
        // Feather only the internal edges (those touching a neighbour). A lone
        // image has none, so it stays crisp and full-bleed.
        const edges = edgesPerImage[i] ?? [];
        return (
          <div
            key={img.src}
            style={{
              position: "absolute",
              left: `${r.left}%`,
              top: `${r.top}%`,
              width: `${r.width}%`,
              height: `${r.height}%`,
            }}
          >
            <Image
              src={img.src}
              alt={img.alt ?? ""}
              fill
              priority={eager}
              sizes="50vw"
              style={{
                objectFit: "cover",
                objectPosition: objectPosition(img.focal),
                // Feather the internal edges, on the image itself — Safari and
                // Firefox don't propagate a mask from the wrapper to the image.
                ...featherStyle(edges),
              }}
            />
          </div>
        );
      })}
    </>
  );
}
