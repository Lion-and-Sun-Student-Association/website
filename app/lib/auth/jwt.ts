import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();
const DURATION_PATTERN = /^(\d+)([smhd])$/;

type SessionRole = "EXEC" | "PRESIDENT" | "OWNER";
type TokenType = "access" | "refresh";

type BaseTokenPayload = {
  sub: string;
  role: SessionRole;
  email: string;
  type: TokenType;
};

export type AccessTokenPayload = BaseTokenPayload & {
  type: "access";
};

export type RefreshTokenPayload = BaseTokenPayload & {
  type: "refresh";
  jti: string;
};

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET in environment");
  }
  return encoder.encode(secret);
}

function parseDurationToSeconds(duration: string): number {
  const match = DURATION_PATTERN.exec(duration.trim());
  if (!match) {
    throw new Error(`Invalid JWT duration: ${duration}`);
  }

  const value = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 60 * 60 * 24;
    default:
      throw new Error(`Unsupported JWT duration unit: ${unit}`);
  }
}

function getAccessExpiry(): string {
  return process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || "15m";
}

function getRefreshExpiry(): string {
  return process.env.JWT_REFRESH_EXPIRES_IN || "30d";
}

async function signToken(payload: AccessTokenPayload | RefreshTokenPayload, expiry: string) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiry)
    .sign(getSecret());
}

async function verifyToken(token: string) {
  const verified = await jwtVerify(token, getSecret());
  return verified.payload as unknown as AccessTokenPayload | RefreshTokenPayload;
}

export function getAccessTokenMaxAgeSeconds() {
  return parseDurationToSeconds(getAccessExpiry());
}

export function getRefreshTokenMaxAgeSeconds() {
  return parseDurationToSeconds(getRefreshExpiry());
}

export function getRefreshTokenExpiresAt() {
  return new Date(Date.now() + getRefreshTokenMaxAgeSeconds() * 1000);
}

export async function signAccessToken(payload: Omit<AccessTokenPayload, "type">): Promise<string> {
  return signToken({ ...payload, type: "access" }, getAccessExpiry());
}

export async function signRefreshToken(
  payload: Omit<RefreshTokenPayload, "type">
): Promise<string> {
  return signToken({ ...payload, type: "refresh" }, getRefreshExpiry());
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const payload = await verifyToken(token);
  if (payload.type !== "access") {
    throw new Error("Invalid access token");
  }

  return payload;
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  const payload = await verifyToken(token);
  if (payload.type !== "refresh" || typeof payload.jti !== "string") {
    throw new Error("Invalid refresh token");
  }

  return payload;
}
