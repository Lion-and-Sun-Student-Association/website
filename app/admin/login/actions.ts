"use server";

import { redirect } from "next/navigation";
import { db } from "@/app/lib/db/client";
import { verifyPassword } from "@/app/lib/auth/password";
import { issueAuthTokens } from "@/app/lib/auth/tokens";
import { writeAuthCookies } from "@/app/lib/auth/session";

export type LoginState = { error?: string };

/**
 * Server Action login for the admin area. Server Actions verify the request
 * Origin automatically, so no extra CSRF token is needed. Authorizes only
 * ADMIN/OWNER (a valid non-admin login would otherwise loop on the gate).
 */
export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const user = await db.user.findUnique({ where: { email } });
  // Same generic message whether the user is missing, inactive, has no
  // password set, or the password is wrong — no account enumeration.
  if (!user || !user.passwordHash || !user.isActive) {
    return { error: "Invalid email or password." };
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return { error: "Invalid email or password." };
  }

  if (user.role !== "ADMIN" && user.role !== "OWNER") {
    return { error: "This account is not authorized for the admin area." };
  }

  const tokens = await issueAuthTokens({
    id: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  });
  await writeAuthCookies(tokens);

  // redirect() throws to interrupt — must be outside any try/catch.
  redirect("/admin/pages");
}
