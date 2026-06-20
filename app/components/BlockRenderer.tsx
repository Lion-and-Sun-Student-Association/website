import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Block } from "@/lib/blocks";
import ImageBlock, { type ImageVariant } from "./ImageBlock";

/**
 * Renders an ordered list of content blocks (markdown / image) into the
 * ReactNode that a <Section> slot expects. This is the read-side counterpart
 * to the admin block editor — both operate on the same Block[] shape from
 * lib/blocks.ts, so authored content renders identically to hand-written JSX.
 *
 * Returns null for an empty/missing slot so <Section> can treat the slot as
 * absent (its optional flanks/satellites only render when given content).
 */
export default function BlockRenderer({
  blocks,
  variant = "default",
}: {
  blocks: Block[] | null | undefined;
  /** Layout variant forwarded to image blocks (depends on the section slot). */
  variant?: ImageVariant;
}) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="flex w-full flex-col gap-4">
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} variant={variant} />
      ))}
    </div>
  );
}

function BlockView({ block, variant }: { block: Block; variant: ImageVariant }) {
  if (block.type === "markdown") {
    return (
      // Typography plugin styles headings/lists/etc.; dark:prose-invert keeps
      // it readable on the dark theme. Markdown is sanitized by react-markdown
      // (no raw HTML is rendered unless a plugin enables it).
      <div className="prose prose-lg dark:prose-invert max-w-prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.value}</ReactMarkdown>
      </div>
    );
  }

  return <ImageBlock block={block} variant={variant} />;
}
