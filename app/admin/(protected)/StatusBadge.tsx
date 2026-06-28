import { ContentStatus } from "@prisma/client";

const LABEL: Record<ContentStatus, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "In review",
  CHANGES_REQUESTED: "Changes requested",
  PUBLISHED: "Published",
};

const CLS: Record<ContentStatus, string> = {
  DRAFT: "bg-white/10 text-muted",
  PENDING_REVIEW: "bg-accent/20 text-accent",
  CHANGES_REQUESTED: "bg-iran-red/20 text-iran-red",
  PUBLISHED: "bg-iran-green/20 text-iran-green",
};

export default function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CLS[status]}`}>
      {LABEL[status]}
    </span>
  );
}
