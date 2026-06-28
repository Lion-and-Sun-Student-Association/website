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
  if (!statement || statement.status !== "PUBLISHED") notFound();

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 pb-16 pt-40">
      <Link
        href="/statements"
        className="mb-6 inline-block text-sm text-muted hover:text-foreground"
      >
        ← All statements
      </Link>

      <article className="glass-card flex flex-col gap-6">
        {/* Official letterhead — centered emblem, issuer, title, date */}
        <header className="flex flex-col items-center gap-4 border-b border-foreground/10 pb-8 text-center">
          <Image
            src="/navbar/Lion_and_Sun.svg.png"
            alt="Lion and Sun Student Association"
            width={56}
            height={56}
            className="opacity-90 [filter:_drop-shadow(0_1px_2px_rgb(0_0_0_/_40%))]"
          />
          <span className="font-caslon text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-foreground/55">
            Statement · Lion and Sun Student Association
          </span>
          <span className="h-px w-10 bg-accent/70" />
          <h1 className="font-caslon text-4xl font-bold leading-tight md:text-5xl">
            {statement.title}
          </h1>
          {statement.date && (
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              {formatDate(statement.date)}
            </p>
          )}
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
