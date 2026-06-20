import { getTranslations } from "@/i18n/getTranslations";
import Section from "@/app/components/Section"

/**
 * "Who We Are" content — logo beside the text on desktop, stacked on mobile.
 * Returns raw content; the surrounding <Section> supplies the glass card.
 */
export default function Goal() {
  const t = getTranslations("Mission");

  return (
    <Section
      id="mission"
      top={<h1 className="text-center text-xl font-bold">{t("heading")}</h1>}
      topAlign="start"
    >
      <div className="flex flex-col items-center gap-4 text-center md:flex-row md:gap-8 md:text-start">
        <div>
          <p className="max-w-prose text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
            {t("text")}
          </p>
        </div>
      </div>
    </Section>
  );
}
