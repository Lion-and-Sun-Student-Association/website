import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/app/lib/auth/jwt";
import { getAccessTokenCookieName } from "@/app/lib/auth/session";
import { db } from "@/app/lib/db/client";
import { isTeamRole, canReview } from "@/app/lib/auth/roles";

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

/**
 * Gate a Server Component / Server Action on team access (EXEC / PRESIDENT /
 * OWNER all work in the admin area). Redirects unauthenticated or non-team
 * visitors to the login page. Returns the user so callers can use its id/role.
 */
export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || !isTeamRole(user.role)) {
    redirect("/admin/login");
  }
  return user;
}

/**
 * Gate a reviewer-only area (members, invites). Team members who aren't
 * reviewers (i.e. execs) are bounced to a page they can use, rather than seeing
 * the roster / invite list.
 */
export async function requireReviewer() {
  const user = await requireAdmin();
  if (!canReview(user.role)) {
    redirect("/admin/pages");
  }
  return user;
}
