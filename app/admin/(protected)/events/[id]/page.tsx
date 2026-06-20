import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById } from "@/lib/getEvents";
import EventForm, { type EventInitial } from "../EventForm";

export const metadata = { title: "Edit event — Admin" };

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  const initial: EventInitial = {
    id: event.id,
    name: event.name,
    description: event.description,
    details: event.details,
    dateTime: event.dateTime.toISOString(),
    endDateTime: event.endDateTime ? event.endDateTime.toISOString() : null,
    posterImageUrl: event.posterImageUrl,
    location: event.location,
    locationLat: event.locationLat,
    locationLng: event.locationLng,
    registrationUrl: event.registrationUrl,
    collaborators: event.collaborators.map((c) => ({ name: c.name, link: c.link })),
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/admin/events"
          className="text-sm text-muted hover:text-foreground"
        >
          ← Events
        </Link>
        <h1 className="font-caslon text-2xl font-bold">Edit event</h1>
      </div>
      <EventForm initial={initial} />
    </div>
  );
}
