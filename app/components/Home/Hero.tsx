import Image from "next/image";
import { getTranslations } from "@/i18n/getTranslations";
import HeroSlideshow from "@/app/components/Home/HeroSlideshow";
import { heroSlides } from "@/app/components/Home/hero.config";

/**
 * Full-bleed hero: a slideshow of photo collages with the club logo and name
 * laid directly over it (no glass card). A dark scrim keeps the text legible.
 * The hero scrolls away normally; the pinned crossfade content begins below it.
 *
 * Layout-critical positioning/sizing is set inline so it can't be dropped by
 * Tailwind's JIT class generation; typography/spacing use utility classes.
 *
 * Slides (collages of 1–4 images) and their focal points are defined in
 * hero.config.ts. Image files go in public/hero/.
 */
export default function Hero() {
  const t = getTranslations("Hero");

  return (
    <section
      aria-label={t("name")}
      style={{ position: "relative", width: "100%", height: "100vh" }}
    >
      {/* Image + scrim are masked together so they fade out at the bottom.
          The text overlay is a sibling — outside the mask — so it stays
          fully opaque. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          maskImage: "linear-gradient(to bottom, black 55%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 55%, transparent 100%)",
        }}
      >
        <HeroSlideshow slides={heroSlides} />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 55%)",
          }}
        />
      </div>

      {/* Logo + name — outside the masked layer so they stay fully white. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "end",
          paddingBottom: 150,
        }}
        className="gap-6 px-6 text-left"
      >
        <Image
          src="/logo.jpg"
          alt=""
          width={200}
          height={200}
          priority
          className="h-64 w-64 rounded-full object-cover md:h-64 md:w-64"
        />
        <h1 className="font-caslon text-4xl font-bold text-white drop-shadow-lg md:text-6xl">
          {t("name")}
        </h1>
        <p className="font-caslon text-white drop-shadow-lg md:text-xl">
          {t("intro")}
          </p>
      </div>
    </section>
  );
}
