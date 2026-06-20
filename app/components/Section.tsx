import { ReactNode } from "react";

type Align = "start" | "center" | "end";

const alignClass: Record<Align, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
};

interface SectionProps {
  /** Main card content — centered in the viewport. */
  children: ReactNode;
  /** Optional satellite cards around the main card. */
  top?: ReactNode;
  bottom?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  /** Align the top/bottom satellites to the main card's edges. */
  topAlign?: Align;
  bottomAlign?: Align;
  /** When a left/right flank is an image, render it as a free side panel
   *  (no card chrome) behind the main card instead of a constrained column. */
  leftImage?: boolean;
  rightImage?: boolean;
  /** Anchor id for in-page links (e.g. "about"). */
  id?: string;
}

/**
 * A glass card whose opacity is driven by scroll position so adjacent sections
 * cross-fade in place (see components/SectionFade.tsx).
 *
 * The fade lives on a plain `.section-fade` wrapper, NOT on the blurred card:
 * Safari and Firefox don't reliably repaint a backdrop-filter element when its
 * opacity changes, so fading a plain wrapper keeps the visible cross-fade
 * working everywhere. At rest (opacity 1) the wrapper isn't a backdrop root,
 * so the inner card's blur shows normally.
 */
function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`section-fade ${className}`}>
      <div className="glass-card">{children}</div>
    </div>
  );
}

/**
 * One full-viewport content block: a centered main card with optional
 * top/left/right/bottom satellite cards. Repeat <Section> per content block;
 * each section cross-fades with its neighbours as you scroll.
 *
 * Left/right satellites are decorative flanks shown on md+ only; top/bottom
 * stack with the main card and align to its edges on all sizes.
 *
 * ```jsx
 * <Section top={<h1>Welcome</h1>} topAlign="start" right={<p>Some aside</p>}>
 *   <YourMainContent />
 * </Section>
 * ```
 */
export default function Section({
  children,
  top,
  bottom,
  left,
  right,
  topAlign = "start",
  bottomAlign = "start",
  leftImage = false,
  rightImage = false,
  id,
}: SectionProps) {
  return (
    <section
      id={id}
      className="flex min-h-screen items-center justify-center px-6 py-12"
    >
      {/* Symmetric 3-column flex skeleton keeps the centre column centred no
          matter what the flanks contain. The flanks always occupy a column
          (flex-1), so removing one never shifts the centre. */}
      <div className="flex w-full max-w-screen-7xl items-center justify-center gap-6">
        {/* Left flank (md+). z-0 + overflow-visible lets a zoomed image flank
            spill toward the centre and sit behind the z-10 main card. */}
        <div className="relative z-0 hidden flex-1 items-center justify-end md:flex">
          {left &&
            (leftImage ? (
              <div className="pointer-events-none w-full">{left}</div>
            ) : (
              <Card className="w-full max-w-xs">{left}</Card>
            ))}
        </div>

        {/* The main card defines the centered height; top/bottom satellites
            float above/below it (out of flow) so they don't shift its center.
            z-10 keeps it above image flanks; flex-[2] + min-w-0 give it more
            width than the flanks while still letting it shrink. */}
        <div className="relative z-10 w-full max-w-7xl flex-[2] min-w-0">
          {top && (
            <div
              className={`absolute bottom-full mb-2 flex w-full ${alignClass[topAlign]}`}
            >
              <Card className="max-w-2xl">{top}</Card>
            </div>
          )}

          <Card className="w-full">{children}</Card>

          {bottom && (
            <div
              className={`absolute top-full mt-6 flex w-full ${alignClass[bottomAlign]}`}
            >
              <Card className="max-w-2xl">{bottom}</Card>
            </div>
          )}
        </div>

        {/* Right flank — mirror of the left. */}
        <div className="relative z-0 hidden flex-1 items-center justify-start md:flex">
          {right &&
            (rightImage ? (
              <div className="pointer-events-none w-full">{right}</div>
            ) : (
              <Card className="w-full max-w-xs">{right}</Card>
            ))}
        </div>
      </div>
    </section>
  );
}
