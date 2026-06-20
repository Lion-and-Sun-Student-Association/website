/**
 * Pure presentation helpers for events, shared by server pages and client
 * components (no "server-only", no DB imports here).
 */

/** A Google Maps link for the event's location (coords if present, else name). */
export function mapsUrl(
  location: string,
  lat?: number | null,
  lng?: number | null
): string {
  const query =
    lat != null && lng != null ? `${lat},${lng}` : location;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** "Sat, Sep 14, 2026 · 7:00 PM" — date + time in one line. */
export function formatDateTime(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "Sep 14, 2026" — compact date for cards. */
export function formatDate(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** True once the event's end (or start, if no end) is in the past. */
export function isPastEvent(
  dateTime: Date | string,
  endDateTime?: Date | string | null
): boolean {
  const end = endDateTime ?? dateTime;
  const d = typeof end === "string" ? new Date(end) : end;
  return d.getTime() < Date.now();
}
