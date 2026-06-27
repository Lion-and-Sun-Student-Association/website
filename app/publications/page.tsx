import Link from "next/link";
import type { Metadata } from "next";
import PageHeading from "@/app/components/PageHeading";
import PublicationCard from "@/app/components/publications/PublicationsCard";
import { getPublicationsPage } from "@/lib/getPublications";

export const metadata: Metadata = { title: "Publications — LSSA" };

// Refresh periodically so newly added publications appear without a redeploy.
export const revalidate = 300;

export default async function PublicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const requested = Number.parseInt(pageParam ?? "1", 10);
  const { publications, page, totalPages, total } = await getPublicationsPage(
    Number.isFinite(requested) ? requested : 1
  );

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 pb-16 pt-40">
      <PageHeading title="Publications" count={total} />

      {publications.length === 0 ? (
        <p className="text-muted">No publications yet. Check back soon.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {publications.map((publication) => (
            <li key={publication.id}>
              <PublicationCard publication={publication} />
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
      href={`/publications?page=${page}`}
      className="rounded-lg border border-white/15 px-3 py-1.5 text-muted transition-colors hover:border-accent hover:text-foreground"
    >
      {children}
    </Link>
  );
}
