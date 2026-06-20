import Link from "next/link";
import type { StatementSummary } from "@/lib/getStatements";
import { formatDate } from "@/lib/events";

/**
 * A horizontal statement card for the /statements list — reads like an entry in
 * a press-release index: a yellow accent spine, a small date label, a prominent
 * title and a short excerpt, with a chevron that nudges on hover.
 */
export default function StatementCard({
  statement,
}: {
  statement: StatementSummary;
}) {
  return (
    <Link
      href={`/statements/${statement.id}`}
      className="group glass-card flex items-stretch gap-4 overflow-hidden p-0 transition-transform hover:-translate-y-0.5 sm:gap-5"
    >
      {/* Accent spine */}
      <span aria-hidden className="w-1.5 shrink-0 self-stretch bg-accent/80" />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-4 pr-3 sm:py-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {statement.date ? formatDate(statement.date) : "Statement"}
        </p>
        <h3 className="font-caslon text-lg font-bold leading-snug group-hover:text-accent sm:text-xl">
          {statement.title}
        </h3>
        {statement.description && (
          <p className="line-clamp-2 text-sm text-foreground/70">
            {statement.description}
          </p>
        )}
      </div>

      {/* Chevron */}
      <span
        aria-hidden
        className="flex shrink-0 items-center pr-4 text-2xl text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent sm:pr-5"
      >
        →
      </span>
    </Link>
  );
}
