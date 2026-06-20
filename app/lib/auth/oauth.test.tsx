import { describe, expect, it } from "vitest";

import { buildOAuthRedirectUri, resolveOAuthOrigin } from "@/app/lib/auth/oauth";

describe("buildOAuthRedirectUri", () => {
  it("uses the incoming localhost origin when provided", () => {
    expect(buildOAuthRedirectUri("http://localhost:3000", "google")).toBe(
      "http://localhost:3000/api/auth/oauth/google"
    );
  });

  it("uses the incoming loopback origin when provided", () => {
    expect(buildOAuthRedirectUri("http://127.0.0.1:3000", "github")).toBe(
      "http://127.0.0.1:3000/api/auth/oauth/github"
    );
  });

  it("falls back to APP_BASE_URL when no origin is provided", () => {
    const previousBaseUrl = process.env.APP_BASE_URL;
    process.env.APP_BASE_URL = "https://sportsdeck-pp2.vercel.app";

    try {
      expect(buildOAuthRedirectUri(undefined, "google")).toBe(
        "https://sportsdeck-pp2.vercel.app/api/auth/oauth/google"
      );
    } finally {
      process.env.APP_BASE_URL = previousBaseUrl;
    }
  });
});

describe("resolveOAuthOrigin", () => {
  it("prefers forwarded headers when present", () => {
    const request = {
      headers: new Headers({
        "x-forwarded-proto": "https",
        "x-forwarded-host": "sportsdeck-pp2.vercel.app",
        host: "internal-host",
      }),
      nextUrl: new URL("http://localhost:3000/api/auth/oauth/google"),
    } as never;

    expect(resolveOAuthOrigin(request)).toBe("https://sportsdeck-pp2.vercel.app");
  });

  it("uses the raw host header before nextUrl origin", () => {
    const request = {
      headers: new Headers({
        host: "127.0.0.1:3000",
      }),
      nextUrl: new URL("http://localhost:3000/api/auth/oauth/google"),
    } as never;

    expect(resolveOAuthOrigin(request)).toBe("http://127.0.0.1:3000");
  });
});
