import { cookies } from "next/headers";
import crypto from "node:crypto";
import type { NextRequest } from "next/server";

const STATE_COOKIE = "lssa_oauth_state";

export type OAuthProvider = "google" | "github";

type OAuthRedirectResult = {
  url?: string;
  error?: string;
};

type OAuthProfileResult = {
  email?: string;
  username?: string;
  error?: string;
};

export function getBaseUrl() {
  return process.env.APP_BASE_URL || "http://localhost:3000";
}

export function buildOAuthRedirectUri(origin: string | undefined, provider: OAuthProvider) {
  const normalizedOrigin = origin?.trim();
  const baseUrl = normalizedOrigin || getBaseUrl();

  return new URL(`/api/auth/oauth/${provider}`, baseUrl).toString();
}

export function resolveOAuthOrigin(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto")?.trim();
  const forwardedHost = request.headers.get("x-forwarded-host")?.trim();
  const host = request.headers.get("host")?.trim();
  const protocol = forwardedProto || request.nextUrl.protocol.replace(/:$/, "");
  const hostname = forwardedHost || host;

  if (hostname) {
    return `${protocol}://${hostname}`;
  }

  return request.nextUrl.origin;
}

function getConfig(provider: OAuthProvider) {
  if (provider === "google") {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
      scope: "openid email profile",
    };
  }

  return {
    clientId: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    authorizeUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    userInfoUrl: "https://api.github.com/user",
    scope: "read:user user:email",
  };
}

export async function createOAuthRedirect(
  provider: OAuthProvider,
  origin?: string
): Promise<OAuthRedirectResult> {
  const config = getConfig(provider);
  if (!config.clientId || !config.clientSecret) {
    return { error: `${provider} OAuth is not configured` };
  }

  const state = crypto.randomBytes(24).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  const redirectUri = buildOAuthRedirectUri(origin, provider);
  const url = new URL(config.authorizeUrl);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scope);
  url.searchParams.set("state", state);

  return { url: url.toString() };
}

export async function exchangeCodeForUser(
  provider: OAuthProvider,
  code: string,
  state: string | null,
  origin?: string
): Promise<OAuthProfileResult> {
  const config = getConfig(provider);
  if (!config.clientId || !config.clientSecret) {
    return { error: `${provider} OAuth is not configured` };
  }

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  if (!state || !expectedState || state !== expectedState) {
    return { error: "Invalid OAuth state" };
  }

  const redirectUri = buildOAuthRedirectUri(origin, provider);
  const tokenRes = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return { error: `Failed to get ${provider} token` };
  }

  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  if (!tokenJson.access_token) {
    return { error: `No ${provider} access token received` };
  }

  const profileRes = await fetch(config.userInfoUrl, {
    headers: {
      authorization: `Bearer ${tokenJson.access_token}`,
      accept: "application/json",
      "user-agent": "lssa-web",
    },
  });

  if (!profileRes.ok) {
    return { error: `Failed to get ${provider} profile` };
  }

  const profile = (await profileRes.json()) as {
    email?: string;
    login?: string;
    name?: string;
  };

  let email = profile.email;
  if (provider === "github" && !email) {
    const emailRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        authorization: `Bearer ${tokenJson.access_token}`,
        accept: "application/json",
        "user-agent": "lssa-web",
      },
    });

    if (emailRes.ok) {
      const emails = (await emailRes.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
      }>;
      const primaryVerified = emails.find((item) => item.primary && item.verified);
      email = primaryVerified?.email;
    }
  }

  if (!email) {
    return { error: `${provider} account does not expose an email` };
  }

  const username =
    profile.login || profile.name?.replace(/\s+/g, "_").toLowerCase() || email.split("@")[0];

  return { email, username };
}
