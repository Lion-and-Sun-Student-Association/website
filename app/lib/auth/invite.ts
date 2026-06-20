import { createHash } from "node:crypto";

/**
 * Hash an invite token for storage/lookup. Only the hash is persisted; the raw
 * token lives solely in the invite link, so a DB leak can't yield usable links.
 */
export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
