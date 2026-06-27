import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth/server";
import { UserRole } from "@prisma/client";

/**
 * Lightweight client-facing check for the navbar's Admin menu. Lives in an API
 * route (not the root layout) so reading the auth cookie doesn't force the
 * whole public site into dynamic rendering.
 */
export async function GET() {
  const user = await getSessionUser();
  const isAdmin =
    !!user && (user.role === UserRole.ADMIN || user.role === UserRole.OWNER);

  return NextResponse.json(
    isAdmin ? { admin: true, email: user!.email } : { admin: false },
    { headers: { "Cache-Control": "no-store" } }
  );
}
