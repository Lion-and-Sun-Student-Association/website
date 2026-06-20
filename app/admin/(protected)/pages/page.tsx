import Link from "next/link";
import { db } from "@/app/lib/db/client";
import CreatePageForm from "./CreatePageForm";
import DeletePageButton from "./DeletePageButton";

export const metadata = { title: "Pages — Admin" };

export default async function PagesListPage() {
  const pages = await db.page.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, slug: true, published: true },
  });

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h1 className="font-caslon text-2xl font-bold">Pages</h1>
        <CreatePageForm />
      </section>

      <section className="flex flex-col gap-2">
        {pages.length === 0 ? (
          <p className="text-muted">No pages yet. Create one above.</p>
        ) : (
          <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
            {pages.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="flex flex-col">
                  <Link
                    href={`/admin/pages/${p.id}`}
                    className="font-medium hover:text-accent"
                  >
                    {p.title}
                  </Link>
                  <span className="text-sm text-muted">/{p.slug}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      p.published
                        ? "bg-iran-green/20 text-iran-green"
                        : "bg-white/10 text-muted"
                    }`}
                  >
                    {p.published ? "Published" : "Draft"}
                  </span>
                  {p.published && (
                    <Link
                      href={`/${p.slug}`}
                      target="_blank"
                      className="text-sm text-muted hover:text-foreground"
                    >
                      View
                    </Link>
                  )}
                  <Link
                    href={`/admin/pages/${p.id}`}
                    className="text-sm text-muted hover:text-foreground"
                  >
                    Edit
                  </Link>
                  <DeletePageButton id={p.id} title={p.title} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
