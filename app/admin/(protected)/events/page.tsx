import Link from "next/link";
import { db } from "@/app/lib/db/client";
import { formatDateTime } from "@/lib/events";
import DeleteEventButton from "./DeleteEventButton";

export const metadata = { title: "Events — Admin" };

export default async function AdminEventsPage() {
  const events = await db.event.findMany({
    orderBy: { dateTime: "desc" },
    select: { id: true, name: true, dateTime: true, location: true },
  });

  return (
    <div className="flex flex-col gap-8">
      <section className="flex items-center justify-between gap-4">
        <h1 className="font-caslon text-2xl font-bold">Events</h1>
        <Link
          href="/admin/events/new"
          className="rounded-lg bg-accent px-4 py-2 font-medium text-black"
        >
          New event
        </Link>
      </section>

      <section className="flex flex-col gap-2">
        {events.length === 0 ? (
          <p className="text-muted">No events yet. Create one above.</p>
        ) : (
          <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
            {events.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="flex flex-col">
                  <Link
                    href={`/admin/events/${e.id}`}
                    className="font-medium hover:text-accent"
                  >
                    {e.name}
                  </Link>
                  <span className="text-sm text-muted">
                    {formatDateTime(e.dateTime)} · {e.location}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    href={`/events/${e.id}`}
                    target="_blank"
                    className="text-sm text-muted hover:text-foreground"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/events/${e.id}`}
                    className="text-sm text-muted hover:text-foreground"
                  >
                    Edit
                  </Link>
                  <DeleteEventButton id={e.id} name={e.name} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
