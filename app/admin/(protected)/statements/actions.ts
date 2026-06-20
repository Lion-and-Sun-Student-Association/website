"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db/client";
import { requireAdmin } from "@/app/lib/auth/server";

export type StatementFormState = { error?: string };

function str(value: FormDataEntryValue | null): string | null {
  const s = String(value ?? "").trim();
  return s.length > 0 ? s : null;
}

/** Create (no id) or update (id present) a statement from the editor form. */
export async function saveStatement(
  _prev: StatementFormState,
  formData: FormData
): Promise<StatementFormState> {
  const admin = await requireAdmin();

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
      await db.statement.update({ where: { id }, data });
    } else {
      await db.statement.create({ data: { ...data, userId: admin.id } });
    }
  } catch {
    return { error: "Could not save the statement. Please try again." };
  }

  revalidatePath("/admin/statements");
  redirect("/admin/statements");
}

export async function deleteStatement(id: string) {
  await requireAdmin();
  await db.statement.delete({ where: { id } });
  revalidatePath("/admin/statements");
}
