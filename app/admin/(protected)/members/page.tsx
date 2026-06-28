import { UserRole } from "@prisma/client";
import { db } from "@/app/lib/db/client";
import { requireReviewer } from "@/app/lib/auth/server";
import { canRemove } from "@/app/lib/auth/roles";
import RemoveMemberButton from "./RemoveMemberButton";

export const metadata = { title: "Team — Admin" };

const ROLE_LABEL: Record<UserRole, string> = {
  EXEC: "Exec",
  PRESIDENT: "President",
  OWNER: "Owner",
};

const ROLE_CLS: Record<UserRole, string> = {
  EXEC: "bg-white/10 text-muted",
  PRESIDENT: "bg-accent/20 text-accent",
  OWNER: "bg-iran-green/20 text-iran-green",
};

export default async function MembersPage() {
  const me = await requireReviewer();

  const members = await db.user.findMany({
    orderBy: [{ isActive: "desc" }, { role: "desc" }, { firstName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-caslon text-2xl font-bold">Team</h1>

      <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
        {members.map((u) => {
          const name = `${u.firstName} ${u.lastName}`;
          const removable = u.id !== me.id && canRemove(me.role, u.role);
          return (
            <li
              key={u.id}
              className={`flex items-center justify-between gap-4 px-4 py-3 ${
                u.isActive ? "" : "opacity-60"
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${ROLE_CLS[u.role]}`}>
                    {ROLE_LABEL[u.role]}
                  </span>
                  {u.id === me.id && <span className="text-xs text-muted">you</span>}
                  {!u.isActive && <span className="text-xs text-iran-red">removed</span>}
                </div>
                <span className="text-sm text-muted">{u.email}</span>
              </div>
              {removable && (
                <RemoveMemberButton id={u.id} name={name} active={u.isActive} />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
