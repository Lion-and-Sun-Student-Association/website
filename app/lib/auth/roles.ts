import { UserRole } from "@prisma/client";

/**
 * Single source of truth for what each role may do. Tiers, low → high:
 *   EXEC      — prepares content (drafts) and submits it for review.
 *   PRESIDENT — everything an exec can do, plus review/publish and invite/remove execs.
 *   OWNER     — everything, plus invite/remove presidents.
 */
const RANK: Record<UserRole, number> = { EXEC: 1, PRESIDENT: 2, OWNER: 3 };

export function roleRank(role: UserRole): number {
  return RANK[role];
}

/** Every signed-in team member — the admin area is open to all three roles. */
export function isTeamRole(role: UserRole): boolean {
  return role === "EXEC" || role === "PRESIDENT" || role === "OWNER";
}

/**
 * Presidents and owners may review: approve & publish, request changes, edit
 * anyone's content, and publish their own content directly.
 */
export function canReview(role: UserRole): boolean {
  return role === "PRESIDENT" || role === "OWNER";
}

/** Roles a given inviter is allowed to grant. */
export function invitableRoles(role: UserRole): UserRole[] {
  if (role === "OWNER") return ["EXEC", "PRESIDENT"];
  if (role === "PRESIDENT") return ["EXEC"];
  return [];
}

export function canInvite(inviter: UserRole, target: UserRole): boolean {
  return invitableRoles(inviter).includes(target);
}

/**
 * Who may deactivate ("remove") a member of the target role. Owners remove
 * presidents and execs; presidents remove execs; nobody removes an owner.
 */
export function canRemove(remover: UserRole, target: UserRole): boolean {
  if (target === "OWNER") return false;
  if (remover === "OWNER") return target === "PRESIDENT" || target === "EXEC";
  if (remover === "PRESIDENT") return target === "EXEC";
  return false;
}
