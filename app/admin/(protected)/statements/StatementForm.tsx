"use client";

import { useActionState } from "react";
import { saveStatement, type StatementFormState } from "./actions";

export type StatementInitial = {
  id: string;
  title: string;
  description: string | null;
  content: string;
  date: string | null; // ISO
};

const initialState: StatementFormState = {};

/** Convert an ISO string to the value a date input expects (yyyy-mm-dd). */
function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const fieldClass =
  "rounded-lg border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-accent";

export default function StatementForm({
  initial,
}: {
  initial?: StatementInitial;
}) {
  const [state, formAction, pending] = useActionState(
    saveStatement,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Title *</span>
        <input
          name="title"
          required
          defaultValue={initial?.title}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Date</span>
        <input
          type="date"
          name="date"
          defaultValue={toDateInput(initial?.date ?? null)}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">
          Short description (used for previews / SEO)
        </span>
        <textarea
          name="description"
          rows={2}
          defaultValue={initial?.description ?? ""}
          className={`${fieldClass} resize-y`}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Content (Markdown) *</span>
        <textarea
          name="content"
          required
          rows={16}
          placeholder="## Our position&#10;…"
          defaultValue={initial?.content ?? ""}
          className={`${fieldClass} resize-y font-mono`}
        />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-iran-red">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-accent px-5 py-2 font-medium text-black disabled:opacity-60"
        >
          {pending ? "Saving…" : initial ? "Save changes" : "Create statement"}
        </button>
      </div>
    </form>
  );
}
