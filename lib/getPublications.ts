import "server-only";

import { cache } from "react";
import { ContentStatus } from "@prisma/client";
import { db } from "@/app/lib/db/client";

export const PUBLICATIONS_PER_PAGE = 10;

export type LoadedPublication = {
  id: string;
  title: string;
  description: string | null;
  authors: string[];
  content: string;
  date: Date | null;
  status: ContentStatus;
  reviewNote: string | null;
};

/** A list-card view of a publication (no full markdown content). */
export type PublicationSummary = Pick<
  LoadedPublication,
  "id" | "title" | "description" | "authors" | "date"
>;

/**
 * A page of publications, newest first (undated ones last). Pagination is
 * page-based (?page=N). DB errors degrade to an empty page so the route still
 * renders.
 */
export async function getPublicationsPage(page: number): Promise<{
  publications: PublicationSummary[];
  page: number;
  totalPages: number;
  total: number;
}> {
  const current = Math.max(1, Math.floor(page) || 1);
  try {
    const where = { status: "PUBLISHED" as const };
    const [total, publications] = await Promise.all([
      db.publication.count({ where }),
      db.publication.findMany({
        where,
        orderBy: [{ date: "desc" }, { title: "asc" }],
        skip: (current - 1) * PUBLICATIONS_PER_PAGE,
        take: PUBLICATIONS_PER_PAGE,
        select: {
          id: true,
          title: true,
          description: true,
          authors: true,
          date: true,
        },
      }),
    ]);
    const totalPages = Math.max(1, Math.ceil(total / PUBLICATIONS_PER_PAGE));
    return { publications, page: current, totalPages, total };
  } catch {
    return { publications: [], page: current, totalPages: 1, total: 0 };
  }
}

/** A single publication by id. Null if missing or the DB is down. */
export const getPublicationById = cache(
  async (id: string): Promise<LoadedPublication | null> => {
    try {
      return await db.publication.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          description: true,
          authors: true,
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
