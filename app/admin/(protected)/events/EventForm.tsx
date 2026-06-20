"use client";

import { useActionState, useState } from "react";
import { saveEvent, type EventFormState } from "./actions";

export type EventInitial = {
  id: string;
  name: string;
  description: string | null;
  details: string | null;
  dateTime: string; // ISO
  endDateTime: string | null; // ISO
  posterImageUrl: string | null;
  location: string;
  locationLat: number | null;
  locationLng: number | null;
  registrationUrl: string | null;
  collaborators: { name: string; link: string | null }[];
};

const initialState: EventFormState = {};

/** Convert an ISO string to the value a datetime-local input expects. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

const fieldClass =
  "rounded-lg border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-accent";

export default function EventForm({ initial }: { initial?: EventInitial }) {
  const [state, formAction, pending] = useActionState(saveEvent, initialState);
  const [collaborators, setCollaborators] = useState<
    { name: string; link: string }[]
  >(
    initial?.collaborators.map((c) => ({ name: c.name, link: c.link ?? "" })) ?? []
  );

  function setCollab(i: number, patch: Partial<{ name: string; link: string }>) {
    setCollaborators((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c))
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <input
        type="hidden"
        name="collaborators"
        value={JSON.stringify(collaborators.filter((c) => c.name.trim()))}
      />

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Name *</span>
        <input name="name" required defaultValue={initial?.name} className={fieldClass} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Start date &amp; time *</span>
          <input
            type="datetime-local"
            name="dateTime"
            required
            defaultValue={toLocalInput(initial?.dateTime ?? null)}
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">End date &amp; time</span>
          <input
            type="datetime-local"
            name="endDateTime"
            defaultValue={toLocalInput(initial?.endDateTime ?? null)}
            className={fieldClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Location *</span>
        <input
          name="location"
          required
          placeholder="Convocation Hall, Toronto"
          defaultValue={initial?.location}
          className={fieldClass}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Latitude</span>
          <input
            name="locationLat"
            type="number"
            step="any"
            placeholder="43.6609"
            defaultValue={initial?.locationLat ?? ""}
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Longitude</span>
          <input
            name="locationLng"
            type="number"
            step="any"
            placeholder="-79.3953"
            defaultValue={initial?.locationLng ?? ""}
            className={fieldClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Poster image URL</span>
        <input
          name="posterImageUrl"
          placeholder="https://…"
          defaultValue={initial?.posterImageUrl ?? ""}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Registration URL</span>
        <input
          name="registrationUrl"
          placeholder="https://…"
          defaultValue={initial?.registrationUrl ?? ""}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">
          Short description (used for previews / SEO; not shown on the event page)
        </span>
        <textarea
          name="description"
          rows={2}
          defaultValue={initial?.description ?? ""}
          className={`${fieldClass} resize-y`}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Details (Markdown — shown on the event page)</span>
        <textarea
          name="details"
          rows={10}
          placeholder="## About this event&#10;…"
          defaultValue={initial?.details ?? ""}
          className={`${fieldClass} resize-y font-mono`}
        />
      </label>

      {/* Collaborators */}
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm text-muted">Collaborators</legend>
        {collaborators.map((c, i) => (
          <div key={i} className="flex flex-wrap items-end gap-2">
            <input
              value={c.name}
              onChange={(e) => setCollab(i, { name: e.target.value })}
              placeholder="Name"
              className={`${fieldClass} flex-1`}
            />
            <input
              value={c.link}
              onChange={(e) => setCollab(i, { link: e.target.value })}
              placeholder="Link (optional)"
              className={`${fieldClass} flex-1`}
            />
            <button
              type="button"
              onClick={() =>
                setCollaborators((prev) => prev.filter((_, idx) => idx !== i))
              }
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-iran-red hover:border-iran-red"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setCollaborators((prev) => [...prev, { name: "", link: "" }])}
          className="self-start rounded-lg border border-dashed border-white/25 px-3 py-1.5 text-sm text-muted hover:border-accent hover:text-foreground"
        >
          + Add collaborator
        </button>
      </fieldset>

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
          {pending ? "Saving…" : initial ? "Save changes" : "Create event"}
        </button>
      </div>
    </form>
  );
}
