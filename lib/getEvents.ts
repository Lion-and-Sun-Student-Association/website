import "server-only";

import { cache } from "react";
import { ContentStatus } from "@prisma/client";
import { db } from "@/app/lib/db/client";

export const EVENTS_PER_PAGE = 10;

export type EventCollaborator = { id: string; name: string; link: string | null };

export type LoadedEvent = {
  id: string;
  name: string;
  description: string | null;
  details: string | null;
  dateTime: Date;
  endDateTime: Date | null;
  posterImageUrl: string | null;
  location: string;
  locationLat: number | null;
  locationLng: number | null;
  registrationUrl: string | null;
  collaborators: EventCollaborator[];
  status: ContentStatus;
  reviewNote: string | null;
};

/** Public routes only ever show published events. */
const PUBLISHED = { status: "PUBLISHED" as const };

const collaboratorsSelect = {
  select: { id: true, name: true, link: true },
  orderBy: { name: "asc" },
} as const;

/**
 * A page of events, newest first. Pagination is page-based (?page=N); the
 * caller renders prev/next from `page`/`totalPages`. DB errors degrade to an
 * empty page so the route still renders.
 */
export async function getEventsPage(page: number): Promise<{
  events: LoadedEvent[];
  page: number;
  totalPages: number;
  total: number;
}> {
  const current = Math.max(1, Math.floor(page) || 1);
  try {
    const [total, events] = await Promise.all([
      db.event.count({ where: PUBLISHED }),
      db.event.findMany({
        where: PUBLISHED,
        orderBy: { dateTime: "desc" },
        skip: (current - 1) * EVENTS_PER_PAGE,
        take: EVENTS_PER_PAGE,
        include: { collaborators: collaboratorsSelect },
      }),
    ]);
    const totalPages = Math.max(1, Math.ceil(total / EVENTS_PER_PAGE));
    return { events, page: current, totalPages, total };
  } catch {
    return { events: [], page: current, totalPages: 1, total: 0 };
  }
}

/** A single event by id, with collaborators. Null if missing or DB is down. */
export const getEventById = cache(async (id: string): Promise<LoadedEvent | null> => {
  try {
    return await db.event.findUnique({
      where: { id },
      include: { collaborators: collaboratorsSelect },
    });
  } catch {
    return null;
  }
});

/**
 * Events for the home-page carousel: a chronological window of recent-past and
 * upcoming events centered on "now", so the slideshow shows both.
 */
export async function getCarouselEvents(limit = 24): Promise<LoadedEvent[]> {
  const now = new Date();
  try {
    const half = Math.ceil(limit / 2);
    const [past, upcoming] = await Promise.all([
      db.event.findMany({
        where: { ...PUBLISHED, dateTime: { gt: now } },
        orderBy: { dateTime: "desc" },
        take: half,
        include: { collaborators: collaboratorsSelect },
      }),
      db.event.findMany({
        where: { ...PUBLISHED, dateTime: { gte: now } },
        orderBy: { dateTime: "asc" },
        take: half,
        include: { collaborators: collaboratorsSelect },
      }),
    ]);
    // Chronological order overall: oldest past → soonest upcoming → later.
    return [...past.reverse(), ...upcoming];
  } catch {
    return [];
  }
}
