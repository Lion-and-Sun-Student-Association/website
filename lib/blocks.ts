/**
 * The serializable content vocabulary for admin-authored pages.
 *
 * A page is a list of Sections (see prisma/schema.prisma). Each Section slot
 * (main / top / bottom / left / right) stores an ordered `Block[]` as JSON.
 * `BlockRenderer` turns that array into the ReactNode that <Section> expects,
 * and the admin editor edits the same array — so this file is the single
 * source of truth for both read and write paths.
 *
 * Keep this file framework-agnostic (no "server-only", no React): it's imported
 * by both server components and client editor components.
 */

export type Focal = { x: number; y: number };

export type MarkdownBlock = {
  type: "markdown";
  /** Raw markdown source, rendered with react-markdown. */
  value: string;
};

export type ImageBlock = {
  type: "image";
  /** Absolute URL or a /public path (admins paste this in for now). */
  src: string;
  alt?: string;
  /** Normalized 0–1 focal point for object-position cropping. */
  focal?: Focal;
  /** Optional caption rendered under the image. */
  caption?: string;
  /** Zoom multiplier applied around the focal point. 1 = no zoom. */
  scale?: number;
  /** Optional zoom override for small screens; falls back to `scale`. */
  scaleMobile?: number;
};

export type Block = MarkdownBlock | ImageBlock;

/** The five content slots of a <Section>. `main` is required. */
export type SectionSlot = "main" | "top" | "bottom" | "left" | "right";

export type Align = "start" | "center" | "end";

/** A section's content as edited/stored — mirrors the Section model's columns. */
export type SectionContent = {
  id: string;
  order: number;
  topAlign: Align;
  bottomAlign: Align;
  main: Block[];
  top?: Block[] | null;
  bottom?: Block[] | null;
  left?: Block[] | null;
  right?: Block[] | null;
};

/**
 * Narrow an untrusted JSON value (Prisma `Json` columns are typed `unknown`)
 * into a Block[]. Drops anything that doesn't match a known block shape, so a
 * malformed row can never crash the renderer.
 */
export function parseBlocks(value: unknown): Block[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isBlock);
}

function isBlock(value: unknown): value is Block {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (v.type === "markdown") return typeof v.value === "string";
  if (v.type === "image") return typeof v.src === "string";
  return false;
}

/** A fresh block of the given type, for the editor's "add block" actions. */
export function emptyBlock(type: Block["type"]): Block {
  return type === "image"
    ? { type: "image", src: "", alt: "" }
    : { type: "markdown", value: "" };
}
