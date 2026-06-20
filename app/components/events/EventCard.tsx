import Link from "next/link";
import Image from "next/image";
import type { LoadedEvent } from "@/lib/getEvents";
import { formatDate, isPastEvent } from "@/lib/events";

/**
 * A single event tile linking to its detail page. Used in the /events grid and
 * the home carousel. `compact` narrows it for the horizontal slideshow.
 */
export default function EventCard({
  event,
  className = "",
}: {
  event: Pick<
    LoadedEvent,
    "id" | "name" | "dateTime" | "endDateTime" | "location" | "posterImageUrl"
  >;
  className?: string;
}) {
  const past = isPastEvent(event.dateTime, event.endDateTime);

  return (
    <Link
      href={`/events/${event.id}`}
      className={`group glass-card flex flex-col gap-3 overflow-hidden p-3 transition-transform hover:-translate-y-1 ${className}`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-white/5">
        {event.posterImageUrl ? (
          <Image
            src={event.posterImageUrl}
            alt={event.name}
            fill
            sizes="(max-width: 768px) 70vw, 320px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted">
            No poster
          </div>
        )}
        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium ${
            past ? "bg-white/15 text-muted" : "bg-accent/90 text-black"
          }`}
        >
          {past ? "Past" : "Upcoming"}
        </span>
      </div>

      <div className="flex flex-col gap-1 px-1 pb-1">
        <h3 className="line-clamp-2 font-medium leading-snug group-hover:text-accent">
          {event.name}
        </h3>
        <p className="text-sm text-muted">{formatDate(event.dateTime)}</p>
        <p className="line-clamp-1 text-sm text-muted">{event.location}</p>
      </div>
    </Link>
  );
}
