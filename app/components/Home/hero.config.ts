/**
 * Hero slideshow content. Each slide is a collage of 1–4 images that
 * cross-fades to the next slide. On mobile, only the first image of each slide
 * (the "primary") is shown, full-bleed.
 *
 * focal: normalized 0–1 coordinates of the point that must stay in frame when
 * the image is cropped to fill its cell (object-position). Defaults to centre
 * ({ x: 0.5, y: 0.5 }). Set it to wherever the subject is — e.g. a face high
 * and left would be { x: 0.35, y: 0.25 }.
 *
 * Put the image files in public/hero/ and reference them as "/hero/<file>".
 */
export type FocalImage = {
  src: string;
  focal?: { x: number; y: number };
  alt?: string;
};

export type Slide = {
  /** 1–4 images. images[0] is the primary (shown alone on mobile). */
  images: FocalImage[];
};

export const heroSlides: Slide[] = [
  // Seed slide so the hero renders before you add collages. Replace freely.
  { 
    images: [
      { src: "/hero/hero.jpg" },
    ]
  },
  {
    images: [
        { src: "/hero/aryamehr-1.webp"},
        { src: "/hero/aryamehr-2.webp"},
        { src: "/hero/aryamehr-3.webp"},
    ]
  }

  // Example collage (uncomment and point at real files in public/hero/):
  // {
  //   images: [
  //     { src: "/hero/protest.jpg", focal: { x: 0.4, y: 0.35 } },
  //     { src: "/hero/vigil.jpg" },
  //     { src: "/hero/crowd.jpg", focal: { x: 0.6, y: 0.5 } },
  //     { src: "/hero/flag.jpg" },
  //   ],
  // },
];
