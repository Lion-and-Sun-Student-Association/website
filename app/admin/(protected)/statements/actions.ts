"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db/client";
import { requireAdmin } from "@/app/lib/auth/server";
import { canReview } from "@/app/lib/auth/roles";

export type StatementFormState = { error?: string };

function str(value: FormDataEntryValue | null): string | null {
  const s = String(value ?? "").trim();
  return s.length > 0 ? s : null;
}

function revalidateStatement(id?: string) {
  revalidatePath("/admin/statements");
  revalidatePath("/statements");
  if (id) revalidatePath(`/statements/${id}`);
}

/** Create (no id) or update (id present) a statement from the editor form. */
export async function saveStatement(
  _prev: StatementFormState,
  formData: FormData
): Promise<StatementFormState> {
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

  const data = {
    title,
    description: str(formData.get("description")),
    content,
    date,
  };

  try {
    if (id) {
      const existing = await db.statement.findUnique({
        where: { id },
        select: { submittedById: true },
      });
      if (!existing) return { error: "Statement not found." };
      // Authors may edit their own work; reviewers may edit anyone's.
      if (existing.submittedById !== me.id && !canReview(me.role)) {
        return { error: "You can only edit your own submissions." };
      }
      await db.statement.update({ where: { id }, data });
    } else {
      // New content always starts as a draft, owned by its author.
      await db.statement.create({
        data: { ...data, submittedById: me.id, status: "DRAFT" },
      });
    }
  } catch {
    return { error: "Could not save the statement. Please try again." };
  }

  revalidateStatement(id ?? undefined);
  redirect("/admin/statements");
}

/** Author (or reviewer) submits a draft / revised item for review. */
export async function submitStatement(id: string) {
  const me = await requireAdmin();
  const s = await db.statement.findUnique({
    where: { id },
    select: { submittedById: true },
  });
  if (!s) return;
  if (s.submittedById !== me.id && !canReview(me.role)) return;
  await db.statement.update({
    where: { id },
    data: { status: "PENDING_REVIEW", submittedAt: new Date(), reviewNote: null },
  });
  revalidateStatement(id);
}

/** Reviewer approves & publishes (also the "publish directly" path for their own). */
export async function publishStatement(id: string) {
  const me = await requireAdmin();
  if (!canReview(me.role)) return;
  await db.statement.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      approvedById: me.id,
      approvedAt: new Date(),
      reviewNote: null,
    },
  });
  revalidateStatement(id);
}

/** Reviewer sends it back to the author with a note. */
export async function requestStatementChanges(id: string, note: string) {
  const me = await requireAdmin();
  if (!canReview(me.role)) return;
  await db.statement.update({
    where: { id },
    data: { status: "CHANGES_REQUESTED", reviewNote: str(note as FormDataEntryValue) },
  });
  revalidateStatement(id);
}

export async function deleteStatement(id: string) {
  const me = await requireAdmin();
  const s = await db.statement.findUnique({
    where: { id },
    select: { submittedById: true },
  });
  if (!s) return;
  if (s.submittedById !== me.id && !canReview(me.role)) return;
  await db.statement.delete({ where: { id } });
  revalidateStatement();
}
