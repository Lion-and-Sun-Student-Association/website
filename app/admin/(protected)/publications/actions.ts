"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db/client";
import { requireAdmin } from "@/app/lib/auth/server";
import { canReview } from "@/app/lib/auth/roles";

export type PublicationFormState = { error?: string };

function str(value: FormDataEntryValue | null): string | null {
  const s = String(value ?? "").trim();
  return s.length > 0 ? s : null;
}

/** Parse the hidden JSON authors field into an ordered list of trimmed names. */
function parseAuthors(raw: string): string[] {
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value
      .map((a) => (typeof a === "string" ? a.trim() : ""))
      .filter((a) => a.length > 0);
  } catch {
    return [];
  }
}

function revalidatePublication(id?: string) {
  revalidatePath("/admin/publications");
  revalidatePath("/publications");
  if (id) revalidatePath(`/publications/${id}`);
}

/** Create (no id) or update (id present) a publication from the editor form. */
export async function savePublication(
  _prev: PublicationFormState,
  formData: FormData
): Promise<PublicationFormState> {
  const me = await requireAdmin();

  const id = str(formData.get("id"));
  const title = str(formData.get("title"));
  const content = str(formData.get("content"));

  if (!title) return { error: "Title is required." };
  if (!content) return { error: "Content is required." };

  const dateRaw = str(formData.get("date"));
  let date: Date | null = null;
  if (dateRaw) {
    date = new Date(dateRaw);
    if (Number.isNaN(date.getTime())) return { error: "Invalid date." };
  }

  const authors = parseAuthors(String(formData.get("authors") ?? "[]"));

  const data = {
    title,
    description: str(formData.get("description")),
    content,
    date,
    authors,
  };

  try {
    if (id) {
      const existing = await db.publication.findUnique({
        where: { id },
        select: { posterId: true },
      });
      if (!existing) return { error: "Publication not found." };
      if (existing.posterId !== me.id && !canReview(me.role)) {
        return { error: "You can only edit your own submissions." };
      }
      // Leave posterId untouched so the original submitter is preserved.
      await db.publication.update({ where: { id }, data });
    } else {
      await db.publication.create({ data: { ...data, posterId: me.id, status: "DRAFT" } });
    }
  } catch {
    return { error: "Could not save the publication. Please try again." };
  }

  revalidatePublication(id ?? undefined);
  redirect("/admin/publications");
}

/** Author (or reviewer) submits a draft / revised publication for review. */
export async function submitPublication(id: string) {
  const me = await requireAdmin();
  const p = await db.publication.findUnique({ where: { id }, select: { posterId: true } });
  if (!p) return;
  if (p.posterId !== me.id && !canReview(me.role)) return;
  await db.publication.update({
    where: { id },
    data: { status: "PENDING_REVIEW", submittedAt: new Date(), reviewNote: null },
  });
  revalidatePublication(id);
}

/** Reviewer approves & publishes (also the direct-publish path). */
export async function publishPublication(id: string) {
  const me = await requireAdmin();
  if (!canReview(me.role)) return;
  await db.publication.update({
    where: { id },
    data: { status: "PUBLISHED", approvedById: me.id, approvedAt: new Date(), reviewNote: null },
  });
  revalidatePublication(id);
}

/** Reviewer sends it back to the author with a note. */
export async function requestPublicationChanges(id: string, note: string) {
  const me = await requireAdmin();
  if (!canReview(me.role)) return;
  await db.publication.update({
    where: { id },
    data: { status: "CHANGES_REQUESTED", reviewNote: note?.trim() || null },
  });
  revalidatePublication(id);
}

export async function deletePublication(id: string) {
  const me = await requireAdmin();
  const p = await db.publication.findUnique({ where: { id }, select: { posterId: true } });
  if (!p) return;
  if (p.posterId !== me.id && !canReview(me.role)) return;
  await db.publication.delete({ where: { id } });
  revalidatePublication();
}
