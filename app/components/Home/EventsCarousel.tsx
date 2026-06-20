"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import EventCard from "@/app/components/events/EventCard";
import type { LoadedEvent } from "@/lib/getEvents";

type CarouselEvent = Pick<
  LoadedEvent,
  "id" | "name" | "dateTime" | "endDateTime" | "location" | "posterImageUrl"
>;

/**
 * A horizontally-scrolling slideshow of events (past + upcoming). Scroll-snap +
 * arrow buttons for manual control, plus a gentle auto-advance that pauses on
 * hover/focus and respects prefers-reduced-motion.
 */
export default function EventsCarousel({ events }: { events: CarouselEvent[] }) {
  const trackRef = useRef<HTMLUListElement>(null);

  function scrollByCards(dir: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("li");
    const step = card ? card.clientWidth + 20 : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (events.length < 3) return;

    let paused = false;
    const pause = () => (paused = true);
    const resume = () => (paused = false);
    track.addEventListener("pointerenter", pause);
    track.addEventListener("pointerleave", resume);
    track.addEventListener("focusin", pause);
    track.addEventListener("focusout", resume);

    const id = window.setInterval(() => {
      if (paused) return;
      const card = track.querySelector("li");
      const step = card ? card.clientWidth + 20 : track.clientWidth * 0.8;
      // Loop back to the start once we reach the end.
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 4000);

    return () => {
      window.clearInterval(id);
      track.removeEventListener("pointerenter", pause);
      track.removeEventListener("pointerleave", resume);
      track.removeEventListener("focusin", pause);
      track.removeEventListener("focusout", resume);
    };
  }, [events.length]);

  if (events.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="font-caslon text-2xl font-bold">Upcoming Events</h2>
        <div className="flex items-center gap-2">
          <Link
            href="/events"
            className="text-sm text-muted hover:text-foreground"
          >
            See all
          </Link>
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            aria-label="Previous events"
            className="glass-btn rounded-full p-2"
          >
            <Arrow dir="left" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            aria-label="Next events"
            className="glass-btn rounded-full p-2"
          >
            <Arrow dir="right" />
          </button>
        </div>
      </div>

      <ul
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {events.map((event) => (
          <li
            key={event.id}
            className="w-52 shrink-0 snap-start sm:w-60"
          >
            <EventCard event={event} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={dir === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
      />
    </svg>
  );
}
