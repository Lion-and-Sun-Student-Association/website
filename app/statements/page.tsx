import Link from "next/link";
import type { Metadata } from "next";
import StatementCard from "@/app/components/statements/StatementCard";
import { getStatementsPage } from "@/lib/getStatements";

export const metadata: Metadata = { title: "Statements — LSSA" };

// Refresh periodically so newly added statements appear without a redeploy.
export const revalidate = 300;

export default async function StatementsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const requested = Number.parseInt(pageParam ?? "1", 10);
  const { statements, page, totalPages, total } = await getStatementsPage(
    Number.isFinite(requested) ? requested : 1
  );

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 pb-16 pt-40">
      <header className="mb-8">
        <div className="glass-card-accent inline-flex flex-col gap-1 px-7 py-5">
          <h1 className="font-caslon text-3xl font-bold text-accent [text-shadow:_1px_1px_2px_rgb(0_0_0_/_35%)]">
            Statements
          </h1>
          <p className="text-sm text-foreground/80">
            {total > 0
              ? `${total} statement${total === 1 ? "" : "s"}`
              : "Our statements will appear here."}
          </p>
        </div>
      </header>

      {statements.length === 0 ? (
        <p className="text-muted">No statements yet. Check back soon.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {statements.map((statement) => (
            <li key={statement.id}>
              <StatementCard statement={statement} />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-4 text-sm">
          <PageLink page={page - 1} disabled={page <= 1}>
            ← Previous
          </PageLink>
          <span className="text-muted">
            Page {page} of {totalPages}
          </span>
          <PageLink page={page + 1} disabled={page >= totalPages}>
            Next →
          </PageLink>
        </nav>
      )}
    </main>
  );
}

function PageLink({
  page,
  disabled,
  children,
}: {
  page: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="cursor-default rounded-lg border border-white/10 px-3 py-1.5 text-muted/40">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={`/statements?page=${page}`}
      className="rounded-lg border border-white/15 px-3 py-1.5 text-muted transition-colors hover:border-accent hover:text-foreground"
    >
      {children}
    </Link>
  );
}
