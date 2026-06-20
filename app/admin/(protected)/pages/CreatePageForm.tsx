"use client";

import { useActionState } from "react";
import { createPage, type CreatePageState } from "./actions";

const initial: CreatePageState = {};

export default function CreatePageForm() {
  const [state, formAction, pending] = useActionState(createPage, initial);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Title</span>
        <input
          name="title"
          required
          placeholder="About Us"
          className="rounded-lg border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-accent"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Slug</span>
        <input
          name="slug"
          required
          placeholder="about"
          className="rounded-lg border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-accent"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-4 py-2 font-medium text-black disabled:opacity-60"
      >
        {pending ? "Creating…" : "New page"}
      </button>
      {state.error && (
        <p role="alert" className="w-full text-sm text-iran-red">
          {state.error}
        </p>
      )}
    </form>
  );
}
