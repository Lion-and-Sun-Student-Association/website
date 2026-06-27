import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/app/lib/auth/jwt";
import { getAccessTokenCookieName } from "@/app/lib/auth/session";
import { db } from "@/app/lib/db/client";
import { UserRole } from "@prisma/client";

/**
 * Session helpers for Server Components and Server Actions, which read the
 * access-token cookie directly via next/headers `cookies()` (the guards in
 * guards.ts are the NextRequest-based equivalents for API route handlers).
 *
 * The access token is short-lived (~15m); this intentionally does NOT refresh
 * it. An expired/absent token simply reads as "no session". Silent refresh
 * would need middleware — see the note in the auth review.
 */
export async function getSessionUser() {
  const store = await cookies();
  const token = store.get(getAccessTokenCookieName())?.value;
  if (!token) return null;

  try {
    const payload = await verifyAccessToken(token);
    const user = await db.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) return null;
    return user;
  } catch {
    // Invalid/expired token, or DB unreachable — treat as no session.
    return null;
  }
}

/** True for ADMIN and OWNER (OWNER is the higher privilege). */
function isAdminRole(role: UserRole) {
  return role === UserRole.ADMIN || role === UserRole.OWNER;
}

/**
 * Gate a Server Component / Server Action on admin access. Redirects
 * unauthenticated or non-admin visitors to the login page. Returns the user
 * so callers can use its id/role.
 */
export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || !isAdminRole(user.role)) {
    redirect("/admin/login");
  }
  return user;
}
