import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CrossfadeStack from "@/app/components/CrossfadeStack";
import Section from "@/app/components/Section";
import BlockRenderer from "@/app/components/BlockRenderer";
import { getPage } from "@/lib/getPage";
import type { Block } from "@/lib/blocks";
import type { ImageVariant } from "@/app/components/ImageBlock";

/** Render a slot only when it has blocks, so empty flanks stay absent (Section
 *  shows a flank whenever its prop is truthy). */
function slot(blocks: Block[] | null | undefined, variant: ImageVariant) {
  return blocks && blocks.length > 0 ? (
    <BlockRenderer blocks={blocks} variant={variant} />
  ) : undefined;
}

/** A left/right flank made purely of images becomes a free side panel. */
function isImageFlank(blocks: Block[] | null | undefined): boolean {
  return !!blocks && blocks.length > 0 && blocks.every((b) => b.type === "image");
}

/**
 * Public renderer for admin-authored pages. Any unmatched top-level path
 * (/[slug]) resolves to a published Page; its sections render as a
 * CrossfadeStack of <Section>s, with each slot's blocks rendered by
 * BlockRenderer. Static routes (e.g. /admin) take precedence over this
 * dynamic segment, and /  is still served by app/page.tsx.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  return { title: page?.title };
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <main>
      <CrossfadeStack>
        {page.sections.map((s) => {
          const leftImage = isImageFlank(s.left);
          const rightImage = isImageFlank(s.right);
          return (
            <Section
              key={s.id}
              id={s.id}
              topAlign={s.topAlign}
              bottomAlign={s.bottomAlign}
              top={slot(s.top, "satellite")}
              bottom={slot(s.bottom, "satellite")}
              left={slot(s.left, leftImage ? "flank" : "default")}
              right={slot(s.right, rightImage ? "flank" : "default")}
              leftImage={leftImage}
              rightImage={rightImage}
            >
              <BlockRenderer blocks={s.main} variant="default" />
            </Section>
          );
        })}
      </CrossfadeStack>
    </main>
  );
}
