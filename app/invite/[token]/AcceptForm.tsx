"use client";

import { useActionState } from "react";
import { acceptInvite, type AcceptState } from "./actions";

const initial: AcceptState = {};

export default function AcceptForm({
  token,
  lockedEmail,
}: {
  token: string;
  lockedEmail: string | null;
}) {
  const [state, formAction, pending] = useActionState(acceptInvite, initial);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <input type="hidden" name="token" value={token} />

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="username"
          required
          readOnly={lockedEmail !== null}
          defaultValue={lockedEmail ?? ""}
          className="rounded-lg border border-white/15 bg-transparent px-3 py-2 outline-none read-only:opacity-70 focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Username</span>
        <input
          name="username"
          required
          className="rounded-lg border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Password (12+ characters)</span>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={12}
          required
          className="rounded-lg border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-accent"
        />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-iran-red">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-accent px-4 py-2 font-medium text-black disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
