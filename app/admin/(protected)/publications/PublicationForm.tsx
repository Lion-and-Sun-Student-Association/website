"use client";

import { useActionState, useState } from "react";
import { savePublication, type PublicationFormState } from "./actions";

export type PublicationInitial = {
  id: string;
  title: string;
  description: string | null;
  content: string;
  date: string | null; // ISO
  authors: string[];
};

const initialState: PublicationFormState = {};

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

export default function PublicationForm({
  initial,
}: {
  initial?: PublicationInitial;
}) {
  const [state, formAction, pending] = useActionState(
    savePublication,
    initialState
  );
  const [authors, setAuthors] = useState<string[]>(initial?.authors ?? []);

  function setAuthor(i: number, value: string) {
    setAuthors((prev) => prev.map((a, idx) => (idx === i ? value : a)));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <input
        type="hidden"
        name="authors"
        value={JSON.stringify(authors.map((a) => a.trim()).filter(Boolean))}
      />

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Title *</span>
        <input
          name="title"
          required
          defaultValue={initial?.title}
          className={fieldClass}
        />
      </label>

      {/* Authors — ordered list (first author shown first on the byline) */}
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm text-muted">Authors</legend>
        {authors.map((a, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-5 shrink-0 text-right text-xs text-muted">
              {i + 1}.
            </span>
            <input
              value={a}
              onChange={(e) => setAuthor(i, e.target.value)}
              placeholder="Author name"
              className={`${fieldClass} flex-1`}
            />
            <button
              type="button"
              onClick={() =>
                setAuthors((prev) => prev.filter((_, idx) => idx !== i))
              }
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-iran-red hover:border-iran-red"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setAuthors((prev) => [...prev, ""])}
          className="self-start rounded-lg border border-dashed border-white/25 px-3 py-1.5 text-sm text-muted hover:border-accent hover:text-foreground"
        >
          + Add author
        </button>
      </fieldset>

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
          placeholder="## Abstract&#10;…"
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
          {pending ? "Saving…" : initial ? "Save changes" : "Create publication"}
        </button>
      </div>
    </form>
  );
}
