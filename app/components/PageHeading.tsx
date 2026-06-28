/**
 * Editorial masthead for the public list pages (Events / Statements /
 * Publications). Sits directly on the dark page background, so the title is the
 * light foreground colour with the yellow accent used as a small graphic tab.
 * The count is shown as a zero-padded serif numeral — an "edition number" touch.
 *
 * The `blur-scrim` class sits a soft blur behind the whole header to settle the
 * floating names for readability.
 */
export default function PageHeading({
  title,
  count,
}: {
  title: string;
  count?: number;
}) {
  return (
    <header className="blur-scrim mb-12 flex flex-col gap-5">
      <span className="h-1 w-12 rounded-full bg-accent" />
      <div className="flex items-baseline justify-between gap-4 border-b border-foreground/15 pb-5">
        <h1 className="font-caslon text-5xl font-bold leading-none text-foreground sm:text-6xl">
          {title}
        </h1>
        {count ? (
          <span className="shrink-0 font-caslon text-xl text-foreground/45">
            {String(count).padStart(2, "0")}
          </span>
        ) : null}
      </div>
    </header>
  );
}
