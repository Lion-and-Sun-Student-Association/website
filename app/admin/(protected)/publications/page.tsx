import Link from "next/link";
import { db } from "@/app/lib/db/client";
import { requireAdmin } from "@/app/lib/auth/server";
import { canReview } from "@/app/lib/auth/roles";
import { formatDate } from "@/lib/events";
import { formatAuthors } from "@/lib/publications";
import StatusBadge from "../StatusBadge";
import PublicationActions from "./PublicationActions";
import DeletePublicationButton from "./DeletePublicationButton";

export const metadata = { title: "Publications — Admin" };

function fullName(u: { firstName: string; lastName: string } | null) {
  return u ? `${u.firstName} ${u.lastName}` : null;
}

export default async function AdminPublicationsPage() {
  const me = await requireAdmin();
  const reviewer = canReview(me.role);

  const publications = await db.publication.findMany({
    orderBy: [{ status: "asc" }, { date: "desc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      date: true,
      authors: true,
      status: true,
      reviewNote: true,
      poster: { select: { firstName: true, lastName: true } },
      approvedBy: { select: { firstName: true, lastName: true } },
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <section className="flex items-center justify-between gap-4">
        <h1 className="font-caslon text-2xl font-bold">Publications</h1>
        <Link
          href="/admin/publications/new"
          className="rounded-lg bg-accent px-4 py-2 font-medium text-black"
        >
          New publication
        </Link>
      </section>

      <section className="flex flex-col gap-2">
        {publications.length === 0 ? (
          <p className="text-muted">No publications yet. Create one above.</p>
        ) : (
          <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
            {publications.map((p) => {
              const byline = formatAuthors(p.authors);
              const submitter = fullName(p.poster);
              const approver = fullName(p.approvedBy);
              return (
                <li
                  key={p.id}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/publications/${p.id}`}
                        className="font-medium hover:text-accent"
                      >
                        {p.title}
                      </Link>
                      <StatusBadge status={p.status} />
                    </div>
                    <span className="text-sm text-muted">
                      {byline || "No authors"}
                      {submitter && <> · Submitted by {submitter}</>}
                      {approver && <> · Approved by {approver}</>}
                      {p.date && <> · {formatDate(p.date)}</>}
                    </span>
                    {p.status === "CHANGES_REQUESTED" && p.reviewNote && (
                      <span className="text-xs text-iran-red">
                        Changes requested: {p.reviewNote}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <PublicationActions id={p.id} status={p.status} canReview={reviewer} />
                    <Link
                      href={`/publications/${p.id}`}
                      target="_blank"
                      className="text-sm text-muted hover:text-foreground"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/publications/${p.id}`}
                      className="text-sm text-muted hover:text-foreground"
                    >
                      Edit
                    </Link>
                    <DeletePublicationButton id={p.id} title={p.title} />
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
