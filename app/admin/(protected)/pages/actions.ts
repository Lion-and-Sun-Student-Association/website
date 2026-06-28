"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db/client";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/app/lib/auth/server";
import { canReview } from "@/app/lib/auth/roles";
import type { Align, Block } from "@/lib/blocks";

function normalizeSlug(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type CreatePageState = { error?: string };

export async function createPage(
  _prev: CreatePageState,
  formData: FormData
): Promise<CreatePageState> {
  const me = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const slug = normalizeSlug(String(formData.get("slug") ?? ""));

  if (!title || !slug) {
    return { error: "Title and slug are required." };
  }

  const existing = await db.page.findUnique({ where: { slug } });
  if (existing) {
    return { error: `A page with slug "${slug}" already exists.` };
  }

  // New pages start as drafts owned by their author.
  const page = await db.page.create({
    data: { title, slug, submittedById: me.id, status: "DRAFT" },
  });
  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${page.id}`);
}

export async function deletePage(id: string) {
  const me = await requireAdmin();
  const p = await db.page.findUnique({ where: { id }, select: { submittedById: true } });
  if (!p) return;
  if (p.submittedById !== me.id && !canReview(me.role)) return;
  await db.page.delete({ where: { id } }); // cascades to sections
  revalidatePath("/admin/pages");
}

type SavedSection = {
  topAlign: Align;
  bottomAlign: Align;
  main: Block[];
  top: Block[];
  bottom: Block[];
  left: Block[];
  right: Block[];
};

export type SavePageInput = {
  id: string;
  title: string;
  slug: string;
  sections: SavedSection[];
};

export type SavePageState = { error?: string; ok?: boolean };

/** An empty optional slot is stored as SQL NULL (Prisma.DbNull). */
function slotJson(blocks: Block[]): Prisma.InputJsonValue | typeof Prisma.DbNull {
  return blocks.length > 0
    ? (blocks as unknown as Prisma.InputJsonValue)
    : Prisma.DbNull;
}

/**
 * Persists a whole page in one transaction: updates page meta, then replaces
 * all sections (delete + recreate in order). Replace-all keeps the save path
 * simple and the stored order always matches the editor's order.
 */
export async function savePage(input: SavePageInput): Promise<SavePageState> {
  const me = await requireAdmin();
  const title = input.title.trim();
  const slug = normalizeSlug(input.slug);

  if (!title || !slug) {
    return { error: "Title and slug are required." };
  }

  const existing = await db.page.findUnique({
    where: { id: input.id },
    select: { submittedById: true },
  });
  if (!existing) return { error: "Page not found." };
  if (existing.submittedById !== me.id && !canReview(me.role)) {
    return { error: "You can only edit your own submissions." };
  }

  // Reject a slug collision with a *different* page.
  const clash = await db.page.findFirst({
    where: { slug, NOT: { id: input.id } },
    select: { id: true },
  });
  if (clash) {
    return { error: `A page with slug "${slug}" already exists.` };
  }

  await db.$transaction(async (tx) => {
    await tx.page.update({
      where: { id: input.id },
      data: { title, slug },
    });
    await tx.section.deleteMany({ where: { pageId: input.id } });
    if (input.sections.length > 0) {
      await tx.section.createMany({
        data: input.sections.map((s, i) => ({
          pageId: input.id,
          order: i,
          topAlign: s.topAlign,
          bottomAlign: s.bottomAlign,
          main: s.main as unknown as Prisma.InputJsonValue,
          top: slotJson(s.top),
          bottom: slotJson(s.bottom),
          left: slotJson(s.left),
          right: slotJson(s.right),
        })),
      });
    }
  });

  revalidatePath("/admin/pages");
  revalidatePath(`/admin/pages/${input.id}`);
  revalidatePath(`/${slug}`);
  return { ok: true };
}

async function revalidatePagePaths(id: string) {
  const p = await db.page.findUnique({ where: { id }, select: { slug: true } });
  revalidatePath("/admin/pages");
  if (p?.slug) revalidatePath(`/${p.slug}`);
}

/** Author (or reviewer) submits a draft / revised page for review. */
export async function submitPage(id: string) {
  const me = await requireAdmin();
  const p = await db.page.findUnique({ where: { id }, select: { submittedById: true } });
  if (!p) return;
  if (p.submittedById !== me.id && !canReview(me.role)) return;
  await db.page.update({
    where: { id },
    data: { status: "PENDING_REVIEW", submittedAt: new Date(), reviewNote: null },
  });
  await revalidatePagePaths(id);
}

/** Reviewer approves & publishes (also the direct-publish path). */
export async function publishPage(id: string) {
  const me = await requireAdmin();
  if (!canReview(me.role)) return;
  await db.page.update({
    where: { id },
    data: { status: "PUBLISHED", approvedById: me.id, approvedAt: new Date(), reviewNote: null },
  });
  await revalidatePagePaths(id);
}

/** Reviewer sends it back to the author with a note. */
export async function requestPageChanges(id: string, note: string) {
  const me = await requireAdmin();
  if (!canReview(me.role)) return;
  await db.page.update({
    where: { id },
    data: { status: "CHANGES_REQUESTED", reviewNote: note?.trim() || null },
  });
  await revalidatePagePaths(id);
}
