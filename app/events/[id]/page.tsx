import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getEventById } from "@/lib/getEvents";
import { formatDateTime, mapsUrl, isPastEvent } from "@/lib/events";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);
  return {
    title: event ? `${event.name} — LSSA` : "Event — LSSA",
    description: event?.description ?? undefined,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  const past = isPastEvent(event.dateTime, event.endDateTime);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 pb-16 pt-40">
      <Link
        href="/events"
        className="mb-6 inline-block text-sm text-muted hover:text-foreground"
      >
        ← All events
      </Link>

      <div className="glass-card flex flex-col gap-6">
        {/* Masthead — emblem + section eyebrow */}
        <div className="flex items-center gap-3 border-b border-foreground/10 pb-5">
          <Image
            src="/navbar/Lion_and_Sun.svg.png"
            alt="LSSA"
            width={36}
            height={36}
            className="opacity-85 [filter:_drop-shadow(0_1px_2px_rgb(0_0_0_/_35%))]"
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/55">
              Event
            </span>
            <span className="text-xs text-muted">
              Lion and Sun Student Association
            </span>
          </div>
        </div>

        {/* Two-column row: title/details left, poster right (stacks on mobile) */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
          {/* Left: badge, title, key facts, register button */}
          <header className="flex flex-1 flex-col gap-3">
            <span
              className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${
                past ? "bg-white/15 text-muted" : "bg-accent/90 text-black"
              }`}
            >
              {past ? "Past event" : "Upcoming"}
            </span>
            <h1 className="font-caslon text-4xl font-bold leading-tight">
              {event.name}
            </h1>

            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-muted">When</dt>
                <dd>
                  {formatDateTime(event.dateTime)}
                  {event.endDateTime && <> – {formatDateTime(event.endDateTime)}</>}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-muted">Where</dt>
                <dd>
                  <a
                    href={mapsUrl(event.location, event.locationLat, event.locationLng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-secondary hover:underline"
                  >
                    {event.location}
                  </a>
                </dd>
              </div>
              {event.collaborators.length > 0 && (
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-muted">With</dt>
                  <dd className="flex flex-wrap gap-x-2 gap-y-1">
                    {event.collaborators.map((c, i) => (
                      <span key={c.id}>
                        {c.link ? (
                          <a
                            href={c.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent-secondary hover:underline"
                          >
                            {c.name}
                          </a>
                        ) : (
                          c.name
                        )}
                        {i < event.collaborators.length - 1 && ","}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>

            {event.registrationUrl && !past && (
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block w-fit rounded-lg bg-accent px-5 py-2 font-medium text-black"
              >
                Register
              </a>
            )}
          </header>

          {/* Right: poster */}
          {event.posterImageUrl && (
            <div className="w-full shrink-0 md:w-56">
              <div
                className="glass-frame overflow-hidden"
                style={{ borderRadius: "1.25rem" }}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl">
                  <Image
                    src={event.posterImageUrl}
                    alt={event.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 14rem"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Details (markdown). Description intentionally omitted — details includes it. */}
        {event.details && (
          <article className="prose prose-base dark:prose-invert max-w-none md:prose-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{event.details}</ReactMarkdown>
          </article>
        )}
      </div>
    </main>
  );
}
