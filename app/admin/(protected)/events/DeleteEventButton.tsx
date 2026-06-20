"use client";

import { useTransition } from "react";
import { deleteEvent } from "./actions";

export default function DeleteEventButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(`Delete "${name}"? This cannot be undone.`)) {
          start(() => deleteEvent(id));
        }
      }}
      className="text-sm text-iran-red hover:underline disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
