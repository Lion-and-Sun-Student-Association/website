import "server-only";

import { cache } from "react";
import { ContentStatus } from "@prisma/client";
import { db } from "@/app/lib/db/client";

export const STATEMENTS_PER_PAGE = 10;

export type LoadedStatement = {
  id: string;
  title: string;
  description: string | null;
  content: string;
  date: Date | null;
  status: ContentStatus;
  reviewNote: string | null;
};

/** A list-card view of a statement (no full markdown content). */
export type StatementSummary = Pick<
  LoadedStatement,
  "id" | "title" | "description" | "date"
>;

/**
 * A page of statements, newest first (undated ones last). Pagination is
 * page-based (?page=N). DB errors degrade to an empty page so the route still
 * renders.
 */
export async function getStatementsPage(page: number): Promise<{
  statements: StatementSummary[];
  page: number;
  totalPages: number;
  total: number;
}> {
  const current = Math.max(1, Math.floor(page) || 1);
  try {
    const where = { status: "PUBLISHED" as const };
    const [total, statements] = await Promise.all([
      db.statement.count({ where }),
      db.statement.findMany({
        where,
        orderBy: [{ date: "desc" }, { title: "asc" }],
        skip: (current - 1) * STATEMENTS_PER_PAGE,
        take: STATEMENTS_PER_PAGE,
        select: { id: true, title: true, description: true, date: true },
      }),
    ]);
    const totalPages = Math.max(1, Math.ceil(total / STATEMENTS_PER_PAGE));
    return { statements, page: current, totalPages, total };
  } catch {
    return { statements: [], page: current, totalPages: 1, total: 0 };
  }
}

/** A single statement by id. Null if missing or the DB is down. */
export const getStatementById = cache(
  async (id: string): Promise<LoadedStatement | null> => {
    try {
      return await db.statement.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          description: true,
          content: true,
          date: true,
          status: true,
          reviewNote: true,
        },
      });
    } catch {
      return null;
    }
  }
);
