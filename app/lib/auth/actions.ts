"use server";

import { redirect } from "next/navigation";
import { db } from "@/app/lib/db/client";
import { getSessionUser } from "@/app/lib/auth/server";
import { clearAuthCookies } from "@/app/lib/auth/session";

/** Revoke the user's active refresh tokens, clear cookies, return to login. */
export async function logout() {
  const user = await getSessionUser();
  if (user) {
    await db.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  await clearAuthCookies();
  redirect("/admin/login");
}
