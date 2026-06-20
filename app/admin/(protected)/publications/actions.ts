"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db/client";
import { requireAdmin } from "@/app/lib/auth/server";

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

/** Create (no id) or update (id present) a publication from the editor form. */
export async function savePublication(
  _prev: PublicationFormState,
  formData: FormData
): Promise<PublicationFormState> {
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
      // Leave posterId untouched so the original poster is preserved.
      await db.publication.update({ where: { id }, data });
    } else {
      await db.publication.create({ data: { ...data, posterId: admin.id } });
    }
  } catch {
    return { error: "Could not save the publication. Please try again." };
  }

  revalidatePath("/admin/publications");
  revalidatePath("/publications");
  if (id) revalidatePath(`/publications/${id}`);
  redirect("/admin/publications");
}

export async function deletePublication(id: string) {
  await requireAdmin();
  await db.publication.delete({ where: { id } });
  revalidatePath("/admin/publications");
  revalidatePath("/publications");
}
