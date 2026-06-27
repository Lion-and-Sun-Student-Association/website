import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../app/lib/auth/password";

/**
 * Creates (or updates) an admin user. Idempotent — safe to re-run.
 *
 * Usage:
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-strong-password' \
 *   npx tsx prisma/seed.ts
 */
const db = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD (and optionally ADMIN_USERNAME) env vars."
    );
  }
  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD should be at least 12 characters.");
  }

  const passwordHash = await hashPassword(password);

  const user = await db.user.upsert({
    where: { email },
    update: { passwordHash, role: "OWNER", isActive: true },
    create: {
      email,
      passwordHash,
      role: "OWNER",
      isActive: true,
    },
  });

  console.log(`✔ Admin ready: ${user.email} (${user.role})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
