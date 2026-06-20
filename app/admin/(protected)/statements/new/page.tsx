import Link from "next/link";
import StatementForm from "../StatementForm";

export const metadata = { title: "New statement — Admin" };

export default function NewStatementPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/admin/statements"
          className="text-sm text-muted hover:text-foreground"
        >
          ← Statements
        </Link>
        <h1 className="font-caslon text-2xl font-bold">New statement</h1>
      </div>
      <StatementForm />
    </div>
  );
}
