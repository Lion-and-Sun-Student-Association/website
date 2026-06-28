import Link from "next/link";
import { db } from "@/app/lib/db/client";
import { requireAdmin } from "@/app/lib/auth/server";
import { canReview } from "@/app/lib/auth/roles";
import StatusBadge from "../StatusBadge";
import CreatePageForm from "./CreatePageForm";
import PageActions from "./PageActions";
import DeletePageButton from "./DeletePageButton";

export const metadata = { title: "Pages — Admin" };

function fullName(u: { firstName: string; lastName: string } | null) {
  return u ? `${u.firstName} ${u.lastName}` : null;
}

export default async function PagesListPage() {
  const me = await requireAdmin();
  const reviewer = canReview(me.role);

  const pages = await db.page.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      reviewNote: true,
      submittedBy: { select: { firstName: true, lastName: true } },
      approvedBy: { select: { firstName: true, lastName: true } },
    },
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
            {pages.map((p) => {
              const submitter = fullName(p.submittedBy);
              const approver = fullName(p.approvedBy);
              return (
                <li
                  key={p.id}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/pages/${p.id}`}
                        className="font-medium hover:text-accent"
                      >
                        {p.title}
                      </Link>
                      <StatusBadge status={p.status} />
                    </div>
                    <span className="text-sm text-muted">
                      /{p.slug}
                      {submitter && <> · By {submitter}</>}
                      {approver && <> · Approved by {approver}</>}
                    </span>
                    {p.status === "CHANGES_REQUESTED" && p.reviewNote && (
                      <span className="text-xs text-iran-red">
                        Changes requested: {p.reviewNote}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <PageActions id={p.id} status={p.status} canReview={reviewer} />
                    {p.status === "PUBLISHED" && (
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
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
