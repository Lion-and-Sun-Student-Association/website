"use client";

import { useTransition } from "react";
import { deletePage } from "./actions";

export default function DeletePageButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(`Delete "${title}"? This cannot be undone.`)) {
          start(() => deletePage(id));
        }
      }}
      className="text-sm text-iran-red hover:underline disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
