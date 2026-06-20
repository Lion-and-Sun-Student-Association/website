import { createHash, randomUUID } from "node:crypto";

import {
  verifyRefreshToken,
  getRefreshTokenExpiresAt,
  signAccessToken,
  signRefreshToken,
} from "@/app/lib/auth/jwt";
import { db } from "@/app/lib/db/client";

type AuthenticatedUser = {
  id: string;
  email: string;
  username: string;
  role: "USER" | "ADMIN" | "OWNER";
  isActive?: boolean;
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = AuthTokens & {
  user: ReturnType<typeof serializeAuthUser>;
};

export function serializeAuthUser(user: AuthenticatedUser) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  };
}

function hashRefreshToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function mintTokens(
  user: AuthenticatedUser
): Promise<AuthTokens & { refreshTokenId: string }> {
  const refreshTokenId = randomUUID();
  const accessToken = await signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
  });
  const refreshToken = await signRefreshToken({
    sub: user.id,
    role: user.role,
    email: user.email,
    jti: refreshTokenId,
  });

  return {
    accessToken,
    refreshToken,
    refreshTokenId,
  };
}

export async function issueAuthTokens(user: AuthenticatedUser): Promise<AuthResponse> {
  const now = new Date();
  const { accessToken, refreshToken, refreshTokenId } = await mintTokens(user);

  await db.$transaction(async (tx) => {
    await tx.refreshToken.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
      },
      data: {
        revokedAt: now,
        replacedAt: now,
      },
    });

    await tx.refreshToken.create({
      data: {
        id: refreshTokenId,
        userId: user.id,
        tokenHash: hashRefreshToken(refreshToken),
        expiresAt: getRefreshTokenExpiresAt(),
      },
    });
  });

  return {
    accessToken,
    refreshToken,
    user: serializeAuthUser(user),
  };
}

export async function rotateRefreshToken(refreshToken: string): Promise<AuthResponse> {
  const payload = await verifyRefreshToken(refreshToken);
  const storedToken = await db.refreshToken.findUnique({
    where: { id: payload.jti },
    include: { user: true },
  });

  // The jti must correspond to a token we issued.
  if (!storedToken) {
    throw new Error("Invalid or expired refresh token");
  }

  // Authenticate the token against the stored record BEFORE interpreting its
  // state, so a forged/mismatched token can't trigger the breach path below.
  if (
    storedToken.userId !== payload.sub ||
    storedToken.tokenHash !== hashRefreshToken(refreshToken)
  ) {
    throw new Error("Invalid or expired refresh token");
  }

  // Reuse detection: a genuine, already-revoked token is being replayed — the
  // hallmark of a stolen refresh token. Revoke the whole family (all of this
  // user's active tokens) so neither the attacker nor the victim can continue.
  if (storedToken.revokedAt) {
    await db.refreshToken.updateMany({
      where: { userId: storedToken.userId, revokedAt: null },
      data: { revokedAt: new Date(), replacedAt: new Date() },
    });
    throw new Error("Refresh token reuse detected");
  }

  if (storedToken.expiresAt <= new Date()) {
    throw new Error("Invalid or expired refresh token");
  }

  if (!storedToken.user.isActive) {
    throw new Error("Invalid session");
  }

  const now = new Date();
  const {
    accessToken,
    refreshToken: nextRefreshToken,
    refreshTokenId,
  } = await mintTokens({
    id: storedToken.user.id,
    email: storedToken.user.email,
    username: storedToken.user.username,
    role: storedToken.user.role,
  });

  await db.$transaction(async (tx) => {
    await tx.refreshToken.updateMany({
      where: {
        userId: storedToken.userId,
        revokedAt: null,
      },
      data: {
        revokedAt: now,
        replacedAt: now,
      },
    });

    await tx.refreshToken.create({
      data: {
        id: refreshTokenId,
        userId: storedToken.userId,
        tokenHash: hashRefreshToken(nextRefreshToken),
        expiresAt: getRefreshTokenExpiresAt(),
      },
    });
  });

  return {
    accessToken,
    refreshToken: nextRefreshToken,
    user: serializeAuthUser({
      id: storedToken.user.id,
      email: storedToken.user.email,
      username: storedToken.user.username,
      role: storedToken.user.role,
    }),
  };
}
