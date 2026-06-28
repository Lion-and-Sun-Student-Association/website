"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { db } from "@/app/lib/db/client";
import { requireAdmin, requireReviewer } from "@/app/lib/auth/server";
import { canInvite } from "@/app/lib/auth/roles";
import { hashInviteToken } from "@/app/lib/auth/invite";

const INVITE_TTL_DAYS = 7;

function baseUrl() {
  return process.env.APP_BASE_URL || "http://localhost:3000";
}

export type CreateInviteState = { link?: string; error?: string };

/**
 * Generates a one-time invite and returns the full accept link. The raw token
 * is shown to the inviting admin exactly once (only its hash is stored), so the
 * link must be copied now — it can't be recovered later.
 */
export async function createInvite(
  _prev: CreateInviteState,
  formData: FormData
): Promise<CreateInviteState> {
  const admin = await requireAdmin();

  // Default to EXEC; an inviter may only grant a role they're allowed to.
  const role = (String(formData.get("role") ?? "").trim() || "EXEC") as UserRole;
  if (!canInvite(admin.role, role)) {
    return { error: "You're not allowed to invite that role." };
  }

  const emailRaw = String(formData.get("email") ?? "").trim().toLowerCase();
  const email = emailRaw.length > 0 ? emailRaw : null;

  if (email) {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return { error: `A user with ${email} already exists.` };
    }
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

  await db.invite.create({
    data: {
      tokenHash: hashInviteToken(token),
      email,
      role,
      expiresAt,
      createdById: admin.id,
    },
  });

  revalidatePath("/admin/invites");
  return { link: `${baseUrl()}/invite/${token}` };
}

export async function revokeInvite(id: string) {
  await requireReviewer();
  await db.invite.delete({ where: { id } });
  revalidatePath("/admin/invites");
}
