"use client";

import { useTransition } from "react";
import { setMemberActive } from "./actions";

export default function RemoveMemberButton({
  id,
  name,
  active,
}: {
  id: string;
  name: string;
  active: boolean;
}) {
  const [pending, start] = useTransition();

  if (active) {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm(`Remove ${name}? They'll lose access immediately.`)) {
            start(() => setMemberActive(id, false));
          }
        }}
        className="text-sm text-iran-red hover:underline disabled:opacity-60"
      >
        {pending ? "Removing…" : "Remove"}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => setMemberActive(id, true))}
      className="text-sm text-muted hover:text-foreground disabled:opacity-60"
    >
      {pending ? "Restoring…" : "Restore"}
    </button>
  );
}
