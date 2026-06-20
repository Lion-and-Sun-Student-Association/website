import { cookies } from "next/headers";
import { getAccessTokenMaxAgeSeconds, getRefreshTokenMaxAgeSeconds } from "@/app/lib/auth/jwt";
import { NextRequest } from "next/server";

const ACCESS_TOKEN_COOKIE = "lssa_access";
const REFRESH_TOKEN_COOKIE = "lssa_refresh";

export function getAccessTokenCookieName() {
  return ACCESS_TOKEN_COOKIE;
}

export function getRefreshTokenCookieName() {
  return REFRESH_TOKEN_COOKIE;
}

export function readBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

export async function readAccessToken(request: NextRequest): Promise<string | null> {
  const bearer = readBearerToken(request);
  if (bearer) {
    return bearer;
  }

  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null;
}

export async function readRefreshTokenCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value || null;
}

export async function writeAccessTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getAccessTokenMaxAgeSeconds(),
  });
}

export async function writeRefreshTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getRefreshTokenMaxAgeSeconds(),
  });
}

export async function writeAuthCookies(tokens: {
  accessToken: string;
  refreshToken: string;
}): Promise<void> {
  await writeAccessTokenCookie(tokens.accessToken);
  await writeRefreshTokenCookie(tokens.refreshToken);
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}
