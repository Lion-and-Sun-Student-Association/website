import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicationById } from "@/lib/getPublications";
import PublicationForm, { type PublicationInitial } from "../PublicationForm";

export const metadata = { title: "Edit publication — Admin" };

export default async function EditPublicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const publication = await getPublicationById(id);
  if (!publication) notFound();

  const initial: PublicationInitial = {
    id: publication.id,
    title: publication.title,
    description: publication.description,
    content: publication.content,
    date: publication.date ? publication.date.toISOString() : null,
    authors: publication.authors,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/admin/publications"
          className="text-sm text-muted hover:text-foreground"
        >
          ← Publications
        </Link>
        <h1 className="font-caslon text-2xl font-bold">Edit publication</h1>
      </div>
      <PublicationForm initial={initial} />
    </div>
  );
}
