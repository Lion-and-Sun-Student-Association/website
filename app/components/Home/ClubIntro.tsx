import LogoBadge from "@/app/components/LogoBadge";
import { getTranslations } from "@/i18n/getTranslations";

/**
 * "Who We Are" content — logo beside the text on desktop, stacked on mobile.
 * Returns raw content; the surrounding <Section> supplies the glass card.
 */
export default function ClubIntro() {
  const t = getTranslations("About");

  return (
    <div className="flex flex-col items-center gap-4 text-center md:flex-row md:gap-8 md:text-start">
      <div className="shrink-0">
        <LogoBadge />
      </div>

      <div>
        <h2 className="mb-4 text-3xl font-bold md:text-4xl">{t("heading")}</h2>
        <p className="max-w-prose text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
          {t("intro")}
        </p>
      </div>
    </div>
  );
}
