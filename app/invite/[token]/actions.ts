"use server";

import { redirect } from "next/navigation";
import { db } from "@/app/lib/db/client";
import { hashInviteToken } from "@/app/lib/auth/invite";
import { hashPassword } from "@/app/lib/auth/password";
import { issueAuthTokens } from "@/app/lib/auth/tokens";
import { writeAuthCookies } from "@/app/lib/auth/session";

export type AcceptState = { error?: string };

/**
 * Accepts an invite: creates the user's own admin account and signs them in.
 * The invite is claimed atomically (conditional updateMany inside the same
 * transaction as the user create) so it can be used exactly once, even under
 * concurrent submits.
 */
export async function acceptInvite(
  _prev: AcceptState,
  formData: FormData
): Promise<AcceptState> {
  const token = String(formData.get("token") ?? "");
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const formEmail = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!token) return { error: "Missing invite token." };
  if (username.length < 2) return { error: "Choose a username (2+ characters)." };
  if (password.length < 12) {
    return { error: "Password must be at least 12 characters." };
  }

  const invite = await db.invite.findUnique({
    where: { tokenHash: hashInviteToken(token) },
  });
  if (!invite || invite.acceptedAt || invite.expiresAt <= new Date()) {
    return { error: "This invite link is invalid or has expired." };
  }

  // A bound invite forces its email; an open invite requires one from the form.
  const email = invite.email ?? formEmail;
  if (!email) return { error: "Email is required." };

  const passwordHash = await hashPassword(password);

  let user;
  try {
    user = await db.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          username,
          passwordHash,
          role: invite.role,
          isActive: true,
        },
      });
      // Claim the invite; 0 rows means it was used concurrently → roll back.
      const claim = await tx.invite.updateMany({
        where: { id: invite.id, acceptedAt: null },
        data: { acceptedAt: new Date() },
      });
      if (claim.count === 0) throw new Error("ALREADY_ACCEPTED");
      return created;
    });
  } catch (err) {
    const code = (err as { code?: string }).code;
    const message = (err as { message?: string }).message;
    if (code === "P2002") {
      return { error: "That email or username is already taken." };
    }
    if (message === "ALREADY_ACCEPTED") {
      return { error: "This invite has already been used." };
    }
    return { error: "Could not create your account. Please try again." };
  }

  // Auto sign-in. issueAuthTokens / cookies / redirect must run outside the
  // transaction (redirect throws to interrupt).
  const tokens = await issueAuthTokens({
    id: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  });
  await writeAuthCookies(tokens);
  redirect("/admin/pages");
}
