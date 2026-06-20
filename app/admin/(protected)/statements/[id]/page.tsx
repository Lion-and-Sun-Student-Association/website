import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/app/lib/db/client";
import StatementForm, { type StatementInitial } from "../StatementForm";

export const metadata = { title: "Edit statement — Admin" };

export default async function EditStatementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const statement = await db.statement.findUnique({ where: { id } });
  if (!statement) notFound();

  const initial: StatementInitial = {
    id: statement.id,
    title: statement.title,
    description: statement.description,
    content: statement.content,
    date: statement.date ? statement.date.toISOString() : null,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/admin/statements"
          className="text-sm text-muted hover:text-foreground"
        >
          ← Statements
        </Link>
        <h1 className="font-caslon text-2xl font-bold">Edit statement</h1>
      </div>
      <StatementForm initial={initial} />
    </div>
  );
}
