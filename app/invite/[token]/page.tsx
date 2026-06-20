import { db } from "@/app/lib/db/client";
import { hashInviteToken } from "@/app/lib/auth/invite";
import AcceptForm from "./AcceptForm";

export const metadata = { title: "Accept invite" };

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await db.invite.findUnique({
    where: { tokenHash: hashInviteToken(token) },
    select: { email: true, expiresAt: true, acceptedAt: true },
  });

  const valid = invite && !invite.acceptedAt && invite.expiresAt > new Date();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      {valid ? (
        <>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="font-caslon text-2xl font-bold">Create your admin account</h1>
            <p className="max-w-sm text-sm text-muted">
              You&apos;ve been invited to the LSSA admin. Choose a username and
              password to finish.
            </p>
          </div>
          <AcceptForm token={token} lockedEmail={invite.email} />
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-caslon text-2xl font-bold">Invite unavailable</h1>
          <p className="max-w-sm text-sm text-muted">
            This invite link is invalid, has expired, or has already been used.
            Ask an admin to send you a new one.
          </p>
        </div>
      )}
    </main>
  );
}
