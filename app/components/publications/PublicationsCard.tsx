import Link from "next/link";
import type { PublicationSummary } from "@/lib/getPublications";
import { formatDate } from "@/lib/events";
import { formatAuthors } from "@/lib/publications";

/**
 * A publication card for the /publications list. Distinct from the statement
 * card: no accent spine, the authors take the spotlight as a byline, and the
 * date is demoted to a small muted line in the top-right corner.
 */
export default function PublicationCard({
  publication,
}: {
  publication: PublicationSummary;
}) {
  const byline = formatAuthors(publication.authors);

  return (
    <Link
      href={`/publications/${publication.id}`}
      className="group glass-card flex flex-col gap-2 transition-transform hover:-translate-y-0.5"
    >
      {/* Top row: kind label + de-emphasized date */}
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Publication
        </span>
        {publication.date && (
          <span className="shrink-0 text-xs text-muted">
            {formatDate(publication.date)}
          </span>
        )}
      </div>

      <h3 className="font-caslon text-xl font-bold leading-snug group-hover:text-accent">
        {publication.title}
      </h3>

      {byline && (
        <p className="text-sm font-medium text-foreground/80">
          <span className="text-muted">by</span> {byline}
        </p>
      )}

      {publication.description && (
        <p className="line-clamp-2 text-sm text-foreground/70">
          {publication.description}
        </p>
      )}
    </Link>
  );
}
