"use client";

import { useState, useTransition } from "react";
import {
  emptyBlock,
  type Align,
  type Block,
  type SectionSlot,
} from "@/lib/blocks";
import { savePage } from "../actions";

/** Shape handed in by the server loader (no client keys yet). */
export type EditorInitial = {
  id: string;
  title: string;
  slug: string;
  sections: EditorSlots[];
};

type EditorSlots = {
  topAlign: Align;
  bottomAlign: Align;
  main: Block[];
  top: Block[];
  bottom: Block[];
  left: Block[];
  right: Block[];
};

/** A section in editor state — same as stored, plus a stable client key. */
type EditorSection = EditorSlots & { key: string };

const ALIGNS: Align[] = ["start", "center", "end"];

// The slots rendered per section, in display order. Flanks are optional;
// `main` is the required centre card.
const FLANK_SLOTS: { slot: Exclude<SectionSlot, "main">; label: string }[] = [
  { slot: "top", label: "Top satellite" },
  { slot: "bottom", label: "Bottom satellite" },
  { slot: "left", label: "Left flank" },
  { slot: "right", label: "Right flank" },
];

function newSection(): EditorSection {
  return {
    key: crypto.randomUUID(),
    topAlign: "start",
    bottomAlign: "start",
    main: [emptyBlock("markdown")],
    top: [],
    bottom: [],
    left: [],
    right: [],
  };
}

export default function PageEditor({ initial }: { initial: EditorInitial }) {
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [sections, setSections] = useState<EditorSection[]>(
    initial.sections.map((s) => ({ ...s, key: crypto.randomUUID() }))
  );
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<{ error?: string; ok?: boolean }>({});

  function patchSection(index: number, patch: Partial<EditorSection>) {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s))
    );
  }

  function moveSection(index: number, dir: -1 | 1) {
    setSections((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  function removeSection(index: number) {
    setSections((prev) => prev.filter((_, i) => i !== index));
  }

  function save() {
    setStatus({});
    start(async () => {
      const result = await savePage({
        id: initial.id,
        title,
        slug,
        sections: sections.map(({ key: _key, ...rest }) => rest),
      });
      setStatus(result);
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page meta */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Slug</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="rounded-lg border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-accent"
            />
          </label>
        </div>
        <p className="text-xs text-muted">
          Saving keeps this a draft. Use the review controls on the Pages list to
          submit it or publish it.
        </p>
      </section>

      {/* Sections */}
      <section className="flex flex-col gap-6">
        {sections.map((section, i) => (
          <SectionCard
            key={section.key}
            index={i}
            total={sections.length}
            section={section}
            onPatch={(patch) => patchSection(i, patch)}
            onMove={(dir) => moveSection(i, dir)}
            onRemove={() => removeSection(i)}
          />
        ))}
        <button
          type="button"
          onClick={() => setSections((prev) => [...prev, newSection()])}
          className="self-start rounded-lg border border-dashed border-white/25 px-4 py-2 text-sm text-muted hover:border-accent hover:text-foreground"
        >
          + Add section
        </button>
      </section>

      {/* Save bar */}
      <div className="sticky bottom-0 flex items-center gap-4 border-t border-white/10 bg-background/80 py-4 backdrop-blur">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-lg bg-accent px-5 py-2 font-medium text-black disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {status.ok && <span className="text-sm text-iran-green">Saved.</span>}
        {status.error && (
          <span role="alert" className="text-sm text-iran-red">
            {status.error}
          </span>
        )}
      </div>
    </div>
  );
}

function SectionCard({
  index,
  total,
  section,
  onPatch,
  onMove,
  onRemove,
}: {
  index: number;
  total: number;
  section: EditorSection;
  onPatch: (patch: Partial<EditorSection>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-medium">Section {index + 1}</h2>
        <div className="flex items-center gap-3 text-sm">
          <label className="flex items-center gap-1 text-muted">
            top align
            <AlignSelect
              value={section.topAlign}
              onChange={(v) => onPatch({ topAlign: v })}
            />
          </label>
          <label className="flex items-center gap-1 text-muted">
            bottom align
            <AlignSelect
              value={section.bottomAlign}
              onChange={(v) => onPatch({ bottomAlign: v })}
            />
          </label>
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="px-1 disabled:opacity-30"
            aria-label="Move section up"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="px-1 disabled:opacity-30"
            aria-label="Move section down"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="text-iran-red hover:underline"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <SlotEditor
          label="Main (centre card)"
          blocks={section.main}
          onChange={(blocks) => onPatch({ main: blocks })}
        />
        {FLANK_SLOTS.map(({ slot, label }) => (
          <SlotEditor
            key={slot}
            label={label}
            blocks={section[slot]}
            onChange={(blocks) => onPatch({ [slot]: blocks })}
          />
        ))}
      </div>
    </div>
  );
}

function AlignSelect({
  value,
  onChange,
}: {
  value: Align;
  onChange: (v: Align) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Align)}
      className="rounded border border-white/15 bg-transparent px-1 py-0.5"
    >
      {ALIGNS.map((a) => (
        <option key={a} value={a} className="bg-background">
          {a}
        </option>
      ))}
    </select>
  );
}

function SlotEditor({
  label,
  blocks,
  onChange,
}: {
  label: string;
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}) {
  function patchBlock(i: number, block: Block) {
    onChange(blocks.map((b, idx) => (idx === i ? block : b)));
  }
  function moveBlock(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }
  function removeBlock(i: number) {
    onChange(blocks.filter((_, idx) => idx !== i));
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-muted">{label}</span>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => onChange([...blocks, emptyBlock("markdown")])}
            className="rounded border border-white/15 px-2 py-1 hover:border-accent"
          >
            + Text
          </button>
          <button
            type="button"
            onClick={() => onChange([...blocks, emptyBlock("image")])}
            className="rounded border border-white/15 px-2 py-1 hover:border-accent"
          >
            + Image
          </button>
        </div>
      </div>

      {blocks.length === 0 ? (
        <p className="text-xs text-muted/70">Empty — slot won&apos;t render.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {blocks.map((block, i) => (
            <BlockEditor
              key={i}
              block={block}
              first={i === 0}
              last={i === blocks.length - 1}
              onChange={(b) => patchBlock(i, b)}
              onMove={(dir) => moveBlock(i, dir)}
              onRemove={() => removeBlock(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BlockEditor({
  block,
  first,
  last,
  onChange,
  onMove,
  onRemove,
}: {
  block: Block;
  first: boolean;
  last: boolean;
  onChange: (b: Block) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded border border-white/10 p-2">
      <div className="mb-1 flex items-center justify-between text-xs text-muted">
        <span className="uppercase tracking-wide">{block.type}</span>
        <div className="flex gap-2">
          <button type="button" onClick={() => onMove(-1)} disabled={first} className="disabled:opacity-30">↑</button>
          <button type="button" onClick={() => onMove(1)} disabled={last} className="disabled:opacity-30">↓</button>
          <button type="button" onClick={onRemove} className="text-iran-red">✕</button>
        </div>
      </div>

      {block.type === "markdown" ? (
        <textarea
          value={block.value}
          onChange={(e) => onChange({ ...block, value: e.target.value })}
          rows={4}
          placeholder="Markdown…"
          className="w-full resize-y rounded border border-white/15 bg-transparent p-2 font-mono text-sm outline-none focus:border-accent"
        />
      ) : (
        <div className="flex flex-col gap-2 text-sm">
          <input
            value={block.src}
            onChange={(e) => onChange({ ...block, src: e.target.value })}
            placeholder="Image URL or /public path"
            className="rounded border border-white/15 bg-transparent px-2 py-1 outline-none focus:border-accent"
          />
          <input
            value={block.alt ?? ""}
            onChange={(e) => onChange({ ...block, alt: e.target.value })}
            placeholder="Alt text"
            className="rounded border border-white/15 bg-transparent px-2 py-1 outline-none focus:border-accent"
          />
          <input
            value={block.caption ?? ""}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
            placeholder="Caption (optional)"
            className="rounded border border-white/15 bg-transparent px-2 py-1 outline-none focus:border-accent"
          />
          <div className="flex gap-2">
            <FocalInput
              label="focal x"
              value={block.focal?.x}
              onChange={(x) => onChange({ ...block, focal: { x, y: block.focal?.y ?? 0.5 } })}
            />
            <FocalInput
              label="focal y"
              value={block.focal?.y}
              onChange={(y) => onChange({ ...block, focal: { x: block.focal?.x ?? 0.5, y } })}
            />
          </div>
          <div className="flex gap-2">
            <ScaleInput
              label="zoom"
              placeholder="1"
              value={block.scale}
              onChange={(scale) => onChange({ ...block, scale })}
            />
            <ScaleInput
              label="zoom (mobile)"
              placeholder="= zoom"
              value={block.scaleMobile}
              onChange={(scaleMobile) => onChange({ ...block, scaleMobile })}
            />
          </div>
          <p className="text-xs text-muted/70">
            Zoom crops in around the focal point — useful when the image is
            too small or wide to fill its slot. Set a separate mobile zoom if
            the image (e.g. a satellite view) needs a different crop on phones.
          </p>
        </div>
      )}
    </div>
  );
}

function FocalInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-1 text-xs text-muted">
      {label}
      <input
        type="number"
        min={0}
        max={1}
        step={0.05}
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-16 rounded border border-white/15 bg-transparent px-1 py-0.5"
      />
    </label>
  );
}

function ScaleInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: number | undefined;
  placeholder?: string;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <label className="flex items-center gap-1 text-xs text-muted">
      {label}
      <input
        type="number"
        min={1}
        max={4}
        step={0.1}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        className="w-16 rounded border border-white/15 bg-transparent px-1 py-0.5"
      />
    </label>
  );
}
