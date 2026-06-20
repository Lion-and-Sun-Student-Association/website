import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getStatementById } from "@/lib/getStatements";
import { formatDate } from "@/lib/events";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const statement = await getStatementById(id);
  return {
    title: statement ? `${statement.title} — LSSA` : "Statement — LSSA",
    description: statement?.description ?? undefined,
  };
}

export default async function StatementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const statement = await getStatementById(id);
  if (!statement) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 pb-16 pt-40">
      <Link
        href="/statements"
        className="mb-6 inline-block text-sm text-muted hover:text-foreground"
      >
        ← All statements
      </Link>

      <article className="glass-card flex flex-col gap-6">
        {/* Issuer block — reads as an official seal/letterhead */}
        <div className="flex flex-col items-center gap-3 border-b border-foreground/10 pb-6">
          <Image
            src="/navbar/Lion_and_Sun.svg.png"
            alt="Lion and Sun Student Association"
            width={56}
            height={56}
            className="opacity-90 [filter:_drop-shadow(0_1px_2px_rgb(0_0_0_/_40%))]"
          />
          <div className="flex flex-col items-center gap-0.5 text-center">
            <p className="font-caslon text-xs font-semibold uppercase tracking-[0.25em] text-foreground/60">
              Statement by
            </p>
            <p className="font-caslon text-sm font-semibold uppercase tracking-[0.2em] text-foreground/90">
              Lion and Sun Student Association
            </p>
          </div>
        </div>

        <header className="flex flex-col gap-3 border-l-4 border-accent/80 pl-5">
          {statement.date && (
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              {formatDate(statement.date)}
            </p>
          )}
          <h1 className="font-caslon text-3xl font-bold leading-tight">
            {statement.title}
          </h1>
        </header>

        

        <div className="prose prose-base dark:prose-invert max-w-none font-garamond md:prose-xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {statement.content}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
