// Two axis fades intersected: the blur stays full across the box and softens
// only near each edge (transparent at the rim → solid just inside), so there
// are no visible edges.
const SCRIM_MASK =
  "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)," +
  "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)";

/**
 * Soft-edged backdrop blur that settles the floating-name background behind
 * content for readability. Drop it as the first child of a `relative isolate`
 * container; it fills the box (plus a small halo) and feathers its rim.
 */
export default function BlurScrim({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute -inset-x-20 -inset-y-12 -z-10 backdrop-blur-md ${className}`}
      style={{
        maskImage: SCRIM_MASK,
        WebkitMaskImage: SCRIM_MASK,
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
      }}
    />
  );
}
