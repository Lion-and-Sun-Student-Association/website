import Link from "next/link";
import { db } from "@/app/lib/db/client";
import { requireAdmin } from "@/app/lib/auth/server";
import { canReview } from "@/app/lib/auth/roles";
import { formatDateTime } from "@/lib/events";
import StatusBadge from "../StatusBadge";
import EventActions from "./EventActions";
import DeleteEventButton from "./DeleteEventButton";

export const metadata = { title: "Events — Admin" };

function fullName(u: { firstName: string; lastName: string } | null) {
  return u ? `${u.firstName} ${u.lastName}` : null;
}

export default async function AdminEventsPage() {
  const me = await requireAdmin();
  const reviewer = canReview(me.role);

  const events = await db.event.findMany({
    orderBy: [{ status: "asc" }, { dateTime: "desc" }],
    select: {
      id: true,
      name: true,
      dateTime: true,
      location: true,
      status: true,
      reviewNote: true,
      createdBy: { select: { firstName: true, lastName: true } },
      approvedBy: { select: { firstName: true, lastName: true } },
    },
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
            {events.map((e) => {
              const submitter = fullName(e.createdBy);
              const approver = fullName(e.approvedBy);
              return (
                <li
                  key={e.id}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/events/${e.id}`}
                        className="font-medium hover:text-accent"
                      >
                        {e.name}
                      </Link>
                      <StatusBadge status={e.status} />
                    </div>
                    <span className="text-sm text-muted">
                      {submitter && <>By {submitter} · </>}
                      {formatDateTime(e.dateTime)} · {e.location}
                      {approver && <> · Approved by {approver}</>}
                    </span>
                    {e.status === "CHANGES_REQUESTED" && e.reviewNote && (
                      <span className="text-xs text-iran-red">
                        Changes requested: {e.reviewNote}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <EventActions id={e.id} status={e.status} canReview={reviewer} />
                    <Link
                      href={`/admin/events/${e.id}`}
                      className="text-sm text-muted hover:text-foreground"
                    >
                      Edit
                    </Link>
                    <DeleteEventButton id={e.id} name={e.name} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
