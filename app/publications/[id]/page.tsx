import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPublicationById } from "@/lib/getPublications";
import { formatDate } from "@/lib/events";
import { formatAuthors } from "@/lib/publications";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const publication = await getPublicationById(id);
  return {
    title: publication ? `${publication.title} — LSSA` : "Publications — LSSA",
    description: publication?.description ?? undefined,
  };
}

export default async function PublicationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const publication = await getPublicationById(id);
  if (!publication) notFound();

  const byline = formatAuthors(publication.authors);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 pb-16 pt-40">
      <Link
        href="/publications"
        className="mb-6 inline-block text-sm text-muted hover:text-foreground"
      >
        ← All Publications
      </Link>

      <article className="glass-card flex flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-foreground/10 pb-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Publication
          </span>

          <h1 className="font-caslon text-3xl font-bold leading-tight md:text-4xl">
            {publication.title}
          </h1>

          {/* Authors take the spotlight */}
          {byline && (
            <p className="text-lg text-foreground/90">
              <span className="text-muted">by</span>{" "}
              <span className="font-medium">{byline}</span>
            </p>
          )}

          {/* Date demoted to a small muted line beside the issuer */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <Image
              src="/navbar/Lion_and_Sun.svg.png"
              alt=""
              width={18}
              height={18}
              className="opacity-70"
            />
            <span>Published by Lion and Sun Student Association</span>
            {publication.date && <span>· {formatDate(publication.date)}</span>}
          </div>
        </header>

        <div className="prose prose-base dark:prose-invert max-w-none font-garamond md:prose-xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {publication.content}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
