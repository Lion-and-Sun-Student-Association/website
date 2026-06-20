"use client";

import { useActionState, useState } from "react";
import { createInvite, type CreateInviteState } from "./actions";

const initial: CreateInviteState = {};

export default function GenerateInvite() {
  const [state, formAction, pending] = useActionState(createInvite, initial);
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!state.link) return;
    await navigator.clipboard.writeText(state.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-3">
      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Restrict to email (optional)</span>
          <input
            name="email"
            type="email"
            placeholder="exec@example.com"
            className="rounded-lg border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-accent px-4 py-2 font-medium text-black disabled:opacity-60"
        >
          {pending ? "Generating…" : "Generate invite"}
        </button>
      </form>

      {state.error && (
        <p role="alert" className="text-sm text-iran-red">
          {state.error}
        </p>
      )}

      {state.link && (
        <div className="flex flex-col gap-1 rounded-lg border border-iran-green/40 bg-iran-green/10 p-3">
          <span className="text-xs text-muted">
            Copy this link now — it&apos;s shown only once:
          </span>
          <div className="flex gap-2">
            <input
              readOnly
              value={state.link}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 rounded border border-white/15 bg-transparent px-2 py-1 text-sm"
            />
            <button
              type="button"
              onClick={copy}
              className="rounded border border-white/15 px-3 py-1 text-sm hover:border-accent"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
