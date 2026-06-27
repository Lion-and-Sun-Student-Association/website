import Link from "next/link";
import type { Metadata } from "next";
import BlurScrim from "@/app/components/BlurScrim";
import PageHeading from "@/app/components/PageHeading";
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
      <PageHeading title="Statements" count={total} />

      {statements.length === 0 ? (
        <div className="relative isolate inline-block">
          <BlurScrim />
          <p className="text-muted">No statements yet. Check back soon.</p>
        </div>
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
