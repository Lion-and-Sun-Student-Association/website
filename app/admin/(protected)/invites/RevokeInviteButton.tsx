"use client";

import { useTransition } from "react";
import { revokeInvite } from "./actions";

export default function RevokeInviteButton({ id }: { id: string }) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("Revoke this invite? The link will stop working.")) {
          start(() => revokeInvite(id));
        }
      }}
      className="text-sm text-iran-red hover:underline disabled:opacity-60"
    >
      {pending ? "Revoking…" : "Revoke"}
    </button>
  );
}
