import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth/server";
import { isTeamRole } from "@/app/lib/auth/roles";

/**
 * Lightweight client-facing check for the navbar's Admin menu. Lives in an API
 * route (not the root layout) so reading the auth cookie doesn't force the
 * whole public site into dynamic rendering. Returns the role too, so the UI can
 * gate reviewer-only controls.
 */
export async function GET() {
  const user = await getSessionUser();
  const isAdmin = !!user && isTeamRole(user.role);

  return NextResponse.json(
    isAdmin ? { admin: true, email: user!.email, role: user!.role } : { admin: false },
    { headers: { "Cache-Control": "no-store" } }
  );
}
