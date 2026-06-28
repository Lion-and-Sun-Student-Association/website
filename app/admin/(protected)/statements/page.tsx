import Link from "next/link";
import { db } from "@/app/lib/db/client";
import { requireAdmin } from "@/app/lib/auth/server";
import { canReview } from "@/app/lib/auth/roles";
import { formatDate } from "@/lib/events";
import StatusBadge from "../StatusBadge";
import StatementActions from "./StatementActions";
import DeleteStatementButton from "./DeleteStatementButton";

export const metadata = { title: "Statements — Admin" };

function fullName(u: { firstName: string; lastName: string } | null) {
  return u ? `${u.firstName} ${u.lastName}` : null;
}

export default async function AdminStatementsPage() {
  const me = await requireAdmin();
  const reviewer = canReview(me.role);

  const statements = await db.statement.findMany({
    // In-review items first so reviewers see what needs them at the top.
    orderBy: [{ status: "asc" }, { date: "desc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      date: true,
      status: true,
      submittedBy: { select: { firstName: true, lastName: true } },
      approvedBy: { select: { firstName: true, lastName: true } },
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <section className="flex items-center justify-between gap-4">
        <h1 className="font-caslon text-2xl font-bold">Statements</h1>
        <Link
          href="/admin/statements/new"
          className="rounded-lg bg-accent px-4 py-2 font-medium text-black"
        >
          New statement
        </Link>
      </section>

      <section className="flex flex-col gap-2">
        {statements.length === 0 ? (
          <p className="text-muted">No statements yet. Create one above.</p>
        ) : (
          <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
            {statements.map((s) => {
              const submitter = fullName(s.submittedBy);
              const approver = fullName(s.approvedBy);
              return (
                <li
                  key={s.id}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/statements/${s.id}`}
                        className="font-medium hover:text-accent"
                      >
                        {s.title}
                      </Link>
                      <StatusBadge status={s.status} />
                    </div>
                    <span className="text-sm text-muted">
                      {submitter && <>By {submitter}</>}
                      {approver && <> · Approved by {approver}</>}
                      {s.date && <> · {formatDate(s.date)}</>}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatementActions id={s.id} status={s.status} canReview={reviewer} />
                    <Link
                      href={`/admin/statements/${s.id}`}
                      className="text-sm text-muted hover:text-foreground"
                    >
                      Edit
                    </Link>
                    <DeleteStatementButton id={s.id} title={s.title} />
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
