import { PrismaClient } from "@/generated/prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

let prismaInitError: Error | null = null;

function resolveDatasourceUrl() {
  const configuredUrl = process.env.DATABASE_URL?.trim();
  if (!configuredUrl) {
    return null;
  }

  return configuredUrl;
}

function createClient() {
  const datasourceUrl = resolveDatasourceUrl();
  if (!datasourceUrl) {
    throw new Error("DATABASE_URL must be configured for the database runtime.");
  }

  return new PrismaClient({
    datasourceUrl,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function getClient() {
  if (global.__prisma) {
    return global.__prisma;
  }

  if (prismaInitError) {
    throw prismaInitError;
  }

  try {
    const client = createClient();
    global.__prisma = client;
    return client;
  } catch (error) {
    prismaInitError =
      error instanceof Error ? error : new Error("Failed to initialize Prisma client.");
    throw prismaInitError;
  }
}

export function hasDatabaseConfig() {
  return Boolean(resolveDatasourceUrl());
}

export function isDatabaseError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    message.includes("DATABASE_URL must be configured") ||
    message.includes("Can't reach database server") ||
    message.includes("Connection refused") ||
    message.includes("ECONNREFUSED") ||
    message.includes("SQLITE") ||
    message.includes("no such table") ||
    message.includes("P1001") ||
    message.includes("P1002") ||
    message.includes("P1017")
  );
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop);

    return typeof value === "function" ? value.bind(client) : value;
  },
});
