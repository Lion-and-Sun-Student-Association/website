"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db/client";
import type { Prisma } from "@prisma/client";
import { requireAdmin } from "@/app/lib/auth/server";

export type EventFormState = { error?: string };

type CollaboratorInput = { name: string; link?: string | null };

function parseCollaborators(raw: string): CollaboratorInput[] {
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value
      .filter((c): c is CollaboratorInput => c && typeof c.name === "string")
      .map((c) => ({ name: c.name.trim(), link: c.link?.trim() || null }))
      .filter((c) => c.name.length > 0);
  } catch {
    return [];
  }
}

function num(value: FormDataEntryValue | null): number | null {
  const s = String(value ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function str(value: FormDataEntryValue | null): string | null {
  const s = String(value ?? "").trim();
  return s.length > 0 ? s : null;
}

/**
 * Resolve free-text collaborators to ids, find-or-create by name (Collaborator
 * name isn't unique in the schema, so we can't use connectOrCreate). Updates a
 * link if it changed. Runs inside the caller's transaction.
 */
async function resolveCollaboratorIds(
  tx: Prisma.TransactionClient,
  list: CollaboratorInput[]
): Promise<string[]> {
  const ids: string[] = [];
  for (const c of list) {
    const existing = await tx.collaborator.findFirst({ where: { name: c.name } });
    if (existing) {
      if (c.link && c.link !== existing.link) {
        await tx.collaborator.update({ where: { id: existing.id }, data: { link: c.link } });
      }
      ids.push(existing.id);
    } else {
      const created = await tx.collaborator.create({
        data: { name: c.name, link: c.link ?? null },
      });
      ids.push(created.id);
    }
  }
  return ids;
}

/** Create (no id) or update (id present) an event from the editor form. */
export async function saveEvent(
  _prev: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const admin = await requireAdmin();

  const id = str(formData.get("id"));
  const name = str(formData.get("name"));
  const location = str(formData.get("location"));
  const dateTimeRaw = str(formData.get("dateTime"));

  if (!name) return { error: "Name is required." };
  if (!dateTimeRaw) return { error: "Start date & time is required." };
  if (!location) return { error: "Location is required." };

  const dateTime = new Date(dateTimeRaw);
  if (Number.isNaN(dateTime.getTime())) return { error: "Invalid start date & time." };

  const endRaw = str(formData.get("endDateTime"));
  let endDateTime: Date | null = null;
  if (endRaw) {
    endDateTime = new Date(endRaw);
    if (Number.isNaN(endDateTime.getTime())) return { error: "Invalid end date & time." };
    if (endDateTime < dateTime) return { error: "End time can't be before the start time." };
  }

  const collaborators = parseCollaborators(String(formData.get("collaborators") ?? "[]"));

  const data = {
    name,
    description: str(formData.get("description")),
    details: str(formData.get("details")),
    dateTime,
    endDateTime,
    posterImageUrl: str(formData.get("posterImageUrl")),
    location,
    locationLat: num(formData.get("locationLat")),
    locationLng: num(formData.get("locationLng")),
    registrationUrl: str(formData.get("registrationUrl")),
  };

  try {
    await db.$transaction(async (tx) => {
      const ids = await resolveCollaboratorIds(tx, collaborators);
      const refs = ids.map((cid) => ({ id: cid }));

      if (id) {
        // `set` replaces the whole relation (update-only operation).
        await tx.event.update({
          where: { id },
          data: { ...data, lastUpdaterId: admin.id, collaborators: { set: refs } },
        });
      } else {
        await tx.event.create({
          data: {
            ...data,
            creatorId: admin.id,
            lastUpdaterId: admin.id,
            collaborators: { connect: refs },
          },
        });
      }
    });
  } catch {
    return { error: "Could not save the event. Please try again." };
  }

  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
  if (id) revalidatePath(`/events/${id}`);
  redirect("/admin/events");
}

export async function deleteEvent(id: string) {
  await requireAdmin();
  await db.event.delete({ where: { id } });
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}
