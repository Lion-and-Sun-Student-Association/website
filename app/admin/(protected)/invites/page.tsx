import { db } from "@/app/lib/db/client";
import GenerateInvite from "./GenerateInvite";
import RevokeInviteButton from "./RevokeInviteButton";

export const metadata = { title: "Invites — Admin" };

function statusOf(invite: { acceptedAt: Date | null; expiresAt: Date }) {
  if (invite.acceptedAt) return { label: "Accepted", cls: "bg-iran-green/20 text-iran-green" };
  if (invite.expiresAt.getTime() < Date.now())
    return { label: "Expired", cls: "bg-white/10 text-muted" };
  return { label: "Pending", cls: "bg-accent/20 text-accent" };
}

export default async function InvitesPage() {
  const invites = await db.invite.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, expiresAt: true, acceptedAt: true, createdAt: true },
  });

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h1 className="font-caslon text-2xl font-bold">Invites</h1>
        <p className="max-w-prose text-sm text-muted">
          Generate a one-time link for a vetted exec. They open it, set their own
          email and password, and get an admin account immediately. Links
          expire in 7 days.
        </p>
        <GenerateInvite />
      </section>

      <section className="flex flex-col gap-2">
        {invites.length === 0 ? (
          <p className="text-muted">No invites yet.</p>
        ) : (
          <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
            {invites.map((inv) => {
              const status = statusOf(inv);
              return (
                <li
                  key={inv.id}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{inv.email ?? "Any email"}</span>
                    <span className="text-sm text-muted">
                      Expires {inv.expiresAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${status.cls}`}>
                      {status.label}
                    </span>
                    {!inv.acceptedAt && <RevokeInviteButton id={inv.id} />}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
