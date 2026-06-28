import Image from "next/image";
import type { Metadata } from "next";
import ScrollReveal from "@/app/components/ScrollReveal";

export const metadata: Metadata = {
  title: "About — LSSA",
  description:
    "The Lion and Sun Student Association is a community of Iranian students at the University of Toronto, united for a free Iran.",
};

/**
 * Editorial "introduce ourselves" rows. Each renders as an image beside text,
 * alternating sides down the page (see ImageTextRow). Swap the images/copy here
 * to update the section — the layout takes care of the rest.
 */
const introBlocks: {
  kicker: string;
  title: string;
  body: string;
  image: string;
  alt: string;
}[] = [
  {
    kicker: "Our community",
    title: "Students, neighbours, friends",
    body: "We are Iranian students at the University of Toronto — undergraduates, graduates, and everyone in between — who came together over a shared hope for our homeland. What began as conversations between friends grew into a community that supports one another on campus and beyond.",
    image: "/hero/aryamehr-1.webp",
    alt: "Members of the Iranian student community gathered together",
  },
  {
    kicker: "Our advocacy",
    title: "Amplifying the voices of Iran",
    body: "We organize gatherings, talks, and commemorations so that the courage of the people of Iran is seen and heard here in Toronto. We stand with those risking everything for their freedom, and we carry their stories to a wider audience.",
    image: "/hero/aryamehr-2.webp",
    alt: "A gathering in support of a free Iran",
  },
  {
    kicker: "On campus",
    title: "A home away from home",
    body: "Beyond advocacy, we are a place to belong. Whether you are newly arrived or have been here for years, our events, study groups, and celebrations are open to anyone who shares our values and wants to be part of the family.",
    image: "/hero/aryamehr-3.webp",
    alt: "Students together on campus",
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 pb-24 pt-40">
      {/* ── Title block — accent tab + editorial masthead ── */}
      <ScrollReveal>
        <header className="flex flex-col gap-4 blur-scrim">
          <span className="h-1 w-12 rounded-full bg-accent" />
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-foreground/55">
            About Us
          </p>
          <h1 className="font-caslon text-5xl font-bold leading-tight text-foreground sm:text-6xl">
            Lion and Sun Student Association
          </h1>
          <p className="max-w-2xl text-lg text-foreground/80">
            A community of Iranian students at the University of Toronto, united
            for a free Iran.
          </p>
        </header>
      </ScrollReveal>

      {/* ── Goal section: editorial lead + accent pull-quote, on one card ── */}
      <section className="mt-16">
        <ScrollReveal>
          <div className="glass-card flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <h2 className="font-caslon text-3xl font-bold">Our Goal</h2>
              <p className="max-w-prose text-lg leading-relaxed text-foreground/80">
                We aim to echo the voices of the brave Iranians fighting for
                their freedom. From campus halls in Toronto to the streets of
                Iran, we believe no act of courage should go unheard — and that
                the diaspora has a duty to amplify it.
              </p>
            </div>

            {/* Pull-quote — sits inside the card, so the card's blur keeps it
                legible; the accent tint gives it a distinct visual beat. */}
            <blockquote className="relative overflow-hidden rounded-xl border-l-4 border-accent bg-accent/10 py-6 pl-8 pr-6">
              <span
                aria-hidden
                className="absolute -top-0 left-3 select-none font-caslon text-6xl text-accent/30"
              >
                &ldquo;
              </span>
              <p className="relative font-caslon text-2xl font-medium leading-snug text-foreground sm:text-3xl">
                We stand behind a free Iran, and behind transitional leader
                Crown Prince Reza Pahlavi.
              </p>
            </blockquote>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Introduction: alternating image + text rows ── */}
      <section className="mt-16 flex flex-col gap-8">
        <ScrollReveal>
          <div className="glass-card flex flex-col gap-2">
            <h2 className="font-caslon text-3xl font-bold">Who We Are</h2>
            <p className="max-w-prose text-foreground/70">
              A little about the people and purpose behind the association.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-4 flex flex-col gap-12 sm:gap-16">
          {introBlocks.map((block, i) => (
            <ImageTextRow key={block.title} block={block} flip={i % 2 === 1} />
          ))}
        </div>
      </section>
    </main>
  );
}

/**
 * One editorial row: an image in a gradient-border glass frame beside a text
 * column. `flip` swaps the sides on desktop; on mobile it always stacks with
 * the image first.
 */
function ImageTextRow({
  block,
  flip,
}: {
  block: (typeof introBlocks)[number];
  flip: boolean;
}) {
  return (
    <ScrollReveal>
      <div
        className={`flex flex-col items-center gap-8 md:flex-row md:gap-12 ${
          flip ? "md:flex-row-reverse" : ""
        }`}
      >
        <div className="w-full md:w-1/2">
          {/* The glass acts as a mat: p-3 inset + a concentric inner radius
              (outer 24px − 12px padding = 12px) so the image echoes the frame's
              rounded shape with a clear gap around it. The aspect-ratio lives on
              the INNER box, not the padded outer one: Safari doesn't resolve a
              child's percentage height against an aspect-ratio parent, which made
              the mat collapse there. borderRadius is inline because `.glass-frame`
              is unlayered and overrides utilities. */}
          <div
            className="glass-frame overflow-hidden p-3"
            style={{ borderRadius: "1.5rem" }}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
              <Image
                src={block.image}
                alt={block.alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <div className="glass-card flex flex-col gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              {block.kicker}
            </p>
            <h3 className="font-caslon text-2xl font-bold leading-snug">
              {block.title}
            </h3>
            <p className="text-lg leading-relaxed text-foreground/75">
              {block.body}
            </p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
