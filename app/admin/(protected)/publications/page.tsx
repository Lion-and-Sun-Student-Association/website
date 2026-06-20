import Link from "next/link";
import { db } from "@/app/lib/db/client";
import { formatDate } from "@/lib/events";
import { formatAuthors } from "@/lib/publications";
import DeletePublicationButton from "./DeletePublicationButton";

export const metadata = { title: "Publications — Admin" };

export default async function AdminPublicationsPage() {
  const publications = await db.publication.findMany({
    orderBy: [{ date: "desc" }, { title: "asc" }],
    select: { id: true, title: true, date: true, authors: true },
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
              return (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div className="flex flex-col">
                    <Link
                      href={`/admin/publications/${p.id}`}
                      className="font-medium hover:text-accent"
                    >
                      {p.title}
                    </Link>
                    <span className="text-sm text-muted">
                      {byline || "No authors"}
                      {p.date && <> · {formatDate(p.date)}</>}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
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
