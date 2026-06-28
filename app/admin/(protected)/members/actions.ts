"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db/client";
import { requireAdmin } from "@/app/lib/auth/server";
import { canRemove } from "@/app/lib/auth/roles";

/**
 * Deactivate ("remove") or restore a team member. Deactivation is a soft-delete
 * (isActive=false): it revokes access while preserving the member's authorship
 * on past content. Permission follows canRemove (owner→presidents/execs,
 * president→execs); you can never remove yourself or an owner.
 */
export async function setMemberActive(id: string, active: boolean) {
  const me = await requireAdmin();
  if (id === me.id) return;

  const target = await db.user.findUnique({ where: { id }, select: { role: true } });
  if (!target) return;
  if (!canRemove(me.role, target.role)) return;

  await db.user.update({ where: { id }, data: { isActive: active } });
  revalidatePath("/admin/members");
}
