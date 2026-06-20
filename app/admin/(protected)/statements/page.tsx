import Link from "next/link";
import { db } from "@/app/lib/db/client";
import { formatDate } from "@/lib/events";
import DeleteStatementButton from "./DeleteStatementButton";

export const metadata = { title: "Statements — Admin" };

export default async function AdminStatementsPage() {
  const statements = await db.statement.findMany({
    orderBy: [{ date: "desc" }, { title: "asc" }],
    select: { id: true, title: true, date: true },
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
            {statements.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="flex flex-col">
                  <Link
                    href={`/admin/statements/${s.id}`}
                    className="font-medium hover:text-accent"
                  >
                    {s.title}
                  </Link>
                  <span className="text-sm text-muted">
                    {s.date ? formatDate(s.date) : "No date"}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    href={`/admin/statements/${s.id}`}
                    className="text-sm text-muted hover:text-foreground"
                  >
                    Edit
                  </Link>
                  <DeleteStatementButton id={s.id} title={s.title} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
