"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { ImageBlock as ImageBlockType } from "@/lib/blocks";

/** How an image block is laid out, depending on which section slot it's in. */
export type ImageVariant =
  | "default" // main slot: 16:9 card-width image
  | "satellite" // top/bottom: short 3:1 strip that fits the viewport budget
  | "flank"; // left/right: portrait side image, free to be scaled/overlap

export default function ImageBlock({
  block,
  variant = "default",
}: {
  block: ImageBlockType;
  variant?: ImageVariant;
}) {
  const [scale, setScale] = useState(block.scale ?? 1);
  const focalX = (block.focal?.x ?? 0.5) * 100;
  const focalY = (block.focal?.y ?? 0.5) * 100;

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    setScale(isMobile ? block.scaleMobile ?? block.scale ?? 1 : block.scale ?? 1);
  }, [block.scale, block.scaleMobile]);

  if (!block.src) return null;

  const frameClass =
    variant === "satellite"
      ? "aspect-[3/1]"
      : variant === "flank"
        ? "aspect-[3/4]"
        : "aspect-video";

  return (
    <figure
      className="m-0 w-full"
      style={{ transform: `scale(${scale})`, transformOrigin: `${focalX}% ${focalY}%` }}
    >
      <div className={`relative w-full overflow-hidden rounded-xl ${frameClass}`}>
        <Image
          src={block.src}
          alt={block.alt ?? ""}
          fill
          sizes={variant === "flank" ? "(max-width: 768px) 0px, 25vw" : "(max-width: 768px) 100vw, 50vw"}
          style={{
            objectFit: "cover",
            objectPosition: `${focalX}% ${focalY}%`,
          }}
        />
      </div>
      {block.caption && (
        <figcaption className="mt-2 text-center text-sm text-muted">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}
