import { notFound } from "next/navigation";
import { db } from "@/app/lib/db/client";
import { parseBlocks, type Align } from "@/lib/blocks";
import PageEditor, { type EditorInitial } from "./PageEditor";

export const metadata = { title: "Edit page — Admin" };

export default async function EditPageRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await db.page.findUnique({
    where: { id },
    include: { sections: { orderBy: { order: "asc" } } },
  });
  if (!page) notFound();

  const initial: EditorInitial = {
    id: page.id,
    title: page.title,
    slug: page.slug,
    published: page.published,
    sections: page.sections.map((s) => ({
      topAlign: (s.topAlign as Align) ?? "start",
      bottomAlign: (s.bottomAlign as Align) ?? "start",
      main: parseBlocks(s.main),
      top: parseBlocks(s.top),
      bottom: parseBlocks(s.bottom),
      left: parseBlocks(s.left),
      right: parseBlocks(s.right),
    })),
  };

  return <PageEditor initial={initial} />;
}
