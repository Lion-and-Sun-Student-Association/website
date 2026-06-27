import { UserRole } from "@prisma/client";
import { verifyAccessToken } from "@/app/lib/auth/jwt";
import { readAccessToken } from "@/app/lib/auth/session";
import { db } from "@/app/lib/db/client";
import { HttpError } from "@/app/lib/http/errors";
import { NextRequest } from "next/server";

type AuthState = Awaited<ReturnType<typeof requireUser>>;

export async function requireUser(request: NextRequest) {
  const token = await readAccessToken(request);
  if (!token) {
    throw new HttpError(401, "Authentication required");
  }

  let payload;
  try {
    payload = await verifyAccessToken(token);
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }
  const user = await db.user.findUnique({
    where: { id: payload.sub },
  });

  if (!user || !user.isActive) {
    throw new HttpError(401, "Invalid session");
  }

  return {
    user
  };
}

export async function requireAdmin(request: NextRequest) {
  const { user } = await requireUser(request);
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.OWNER) {
    throw new HttpError(403, "Admin access required");
  }
  return user;
}
