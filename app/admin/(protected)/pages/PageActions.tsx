"use client";

import { useTransition } from "react";
import { ContentStatus } from "@prisma/client";
import { submitPage, publishPage, requestPageChanges } from "./actions";

const btn = "rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-60";

/** Role- and status-aware review controls for a page. */
export default function PageActions({
  id,
  status,
  canReview,
}: {
  id: string;
  status: ContentStatus;
  canReview: boolean;
}) {
  const [pending, start] = useTransition();

  if (status === "PUBLISHED") return null;

  const submittable = status === "DRAFT" || status === "CHANGES_REQUESTED";

  return (
    <div className="flex items-center gap-2">
      {submittable && !canReview && (
        <button
          disabled={pending}
          onClick={() => start(() => submitPage(id))}
          className={`${btn} bg-accent text-black`}
        >
          Submit for review
        </button>
      )}

      {canReview && submittable && (
        <button
          disabled={pending}
          onClick={() => start(() => publishPage(id))}
          className={`${btn} bg-iran-green/90 text-black`}
        >
          Publish
        </button>
      )}

      {canReview && status === "PENDING_REVIEW" && (
        <>
          <button
            disabled={pending}
            onClick={() => start(() => publishPage(id))}
            className={`${btn} bg-iran-green/90 text-black`}
          >
            Approve &amp; publish
          </button>
          <button
            disabled={pending}
            onClick={() => {
              const note = prompt("What changes are needed?")?.trim();
              if (note) start(() => requestPageChanges(id, note));
            }}
            className={`${btn} bg-white/10 text-foreground hover:bg-white/15`}
          >
            Request changes
          </button>
        </>
      )}

      {!canReview && status === "PENDING_REVIEW" && (
        <span className="text-xs text-muted">Awaiting review</span>
      )}
    </div>
  );
}
