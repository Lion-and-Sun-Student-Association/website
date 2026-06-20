import "server-only";

import { cache } from "react";
import { db } from "@/app/lib/db/client";
import { parseBlocks, type Align, type SectionContent } from "@/lib/blocks";

export type LoadedPage = {
  id: string;
  slug: string;
  title: string;
  sections: SectionContent[];
};

/**
 * Loads a published page and its sections (ordered) by slug, parsing each
 * slot's JSON into a validated Block[]. Returns null if the page doesn't exist
 * or isn't published. Wrapped in React `cache` so generateMetadata and the page
 * component share one query per request.
 */
export const getPage = cache(async (slug: string): Promise<LoadedPage | null> => {
  const page = await db.page.findFirst({
    where: { slug, published: true },
    include: { sections: { orderBy: { order: "asc" } } },
  });
  if (!page) return null;

  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    sections: page.sections.map((s) => ({
      id: s.id,
      order: s.order,
      topAlign: (s.topAlign as Align) ?? "start",
      bottomAlign: (s.bottomAlign as Align) ?? "start",
      main: parseBlocks(s.main),
      top: parseBlocks(s.top),
      bottom: parseBlocks(s.bottom),
      left: parseBlocks(s.left),
      right: parseBlocks(s.right),
    })),
  };
});
