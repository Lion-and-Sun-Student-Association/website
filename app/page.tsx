import ClubIntro from "@/app/components/Home/ClubIntro";
import Goal from "@/app/components/Home/Goal";
import Hero from "@/app/components/Home/Hero";
import EventsCarousel from "@/app/components/Home/EventsCarousel";
import Section from "@/app/components/Section";
import CrossfadeStack from "@/app/components/CrossfadeStack";
import { getTranslations } from "@/i18n/getTranslations";
import { getCarouselEvents } from "@/lib/getEvents";

// Refresh so newly added events show up in the carousel without a redeploy.
export const revalidate = 300;

export default async function Home() {
  const t = getTranslations("Home");
  const events = await getCarouselEvents();

  return (
    <main>
      {/* Full-width hero banner. Scrolls away, then the pinned content begins. */}
      <Hero />

      {/* Events slideshow — first thing under the hero. */}
      <EventsCarousel events={events} />

      {/* Each child is a pinned slide; they cross-fade in place as you scroll. */}
      <CrossfadeStack>
        {/* Intro block: "Welcome" sits above the main card, left-aligned to it. */}
        <Section
          id="about"
          top={<h1 className="text-center text-xl font-bold">{t("welcome")}</h1>}
          topAlign="start"
        >
          <ClubIntro />
        </Section>

        <Goal />
      </CrossfadeStack>
    </main>
  );
}
