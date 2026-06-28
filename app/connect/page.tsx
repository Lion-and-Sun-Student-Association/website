import type { Metadata } from "next";
import ScrollReveal from "@/app/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Connect — LSSA",
  description:
    "Get in touch with the Lion and Sun Student Association or find out how to get involved.",
};

const INSTAGRAM_URL = "https://www.instagram.com/lssa.uoft/";
const SIGNUP_URL = "https://docs.google.com/forms/d/e/1FAIpQLSf5pqdlbUzx170rC5v4QWNpMQxgZU1iaapne1Dvn-t06GFjKw/viewform";
const EMAIL = "lionandsun.uoft@gmail.com";

export default function ConnectPage() {
  // Shared so the link and the (no-URL) fallback render identically. The
  // group-hover styles only fire when an ancestor has `group` (the <a>), so the
  // static fallback simply stays inert. Instagram purple: #C13584.
  const instagramCardInner = (
    <>
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-2 font-medium transition-colors duration-300 ease-in-out group-hover:text-[#C13584]">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 transition-transform duration-300 ease-in-out scale-100 group-hover:scale-110"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
          Instagram
        </span>
        <span className="text-sm text-foreground/60">
          Events, updates, and community moments
        </span>
      </div>
      <span className="shrink-0 px-4 py-2 text-sm font-medium">
        @lssa.uoft
      </span>
    </>
  );


  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 pb-24 pt-40">
      <ScrollReveal>
        <header className="blur-scrim flex flex-col gap-4">
          <span className="h-1 w-12 rounded-full bg-accent" />
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-foreground/55">
            Connect
          </p>
          <h1 className="font-caslon text-5xl font-bold leading-tight text-foreground sm:text-6xl">
            Get in touch
          </h1>
          <p className="max-w-xl text-lg text-foreground/80">
            Whether you want to follow our work, collaborate, or join the team —
            we'd love to hear from you.
          </p>
        </header>
      </ScrollReveal>

      {/* ── Social ── */}
      <section className="mt-16 flex flex-col gap-4">
        <ScrollReveal>
          <h2 className="font-caslon text-2xl font-bold text-foreground blur-scrim">
            Follow Us
          </h2>
        </ScrollReveal>

        <ScrollReveal>
          {INSTAGRAM_URL ? (
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group glass-card flex items-center justify-between gap-6 transition-transform duration-300 ease-in-out scale-100 hover:scale-[1.02]"
            >
              {instagramCardInner}
            </a>
          ) : (
            <div className="glass-card flex items-center justify-between gap-6">
              Comming Soon
            </div>
          )}
        </ScrollReveal>
      </section>

      {/* ── Join the team ── */}
      <section className="mt-16 flex flex-col gap-4">
        <ScrollReveal>
          <h2 className="font-caslon text-2xl font-bold text-foreground blur-scrim">
            Join the Student Association
          </h2>
        </ScrollReveal>

        <ScrollReveal>
            <a
              href={SIGNUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group glass-card flex items-center justify-between gap-6 transition-transform duration-300 ease-in-out scale-100 hover:scale-[1.02]"
            >
              <div className="flex flex-col gap-1">
        <span className="flex items-center gap-2 font-medium transition-colors duration-300 ease-in-out group-hover:text-[#007FA3]">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 transition-transform duration-300 ease-in-out scale-100 group-hover:scale-110"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
          Membership
        </span>
        <span className="text-sm text-foreground/60">
          Read our consititution and join us as a member
        </span>
      </div>
      <span className="shrink-0 px-4 py-2 text-sm font-medium">
        Google Forms
      </span>
            </a>
        </ScrollReveal>
      </section>

      {/* ── Email ── */}
      <section className="mt-16 flex flex-col gap-4">
        <ScrollReveal>
          <h2 className="font-caslon text-2xl font-bold text-foreground blur-scrim">
            Email Us
          </h2>
        </ScrollReveal>

        <ScrollReveal>
          {EMAIL ? (
            <a
              href={`mailto:${EMAIL}`}
              className="group glass-card flex items-center justify-between gap-6 transition-transform duration-300 ease-in-out scale-100 hover:scale-[1.02]"
            >
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-2 font-medium transition-colors duration-300 ease-in-out group-hover:text-accent">
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 transition-transform duration-300 ease-in-out scale-100 group-hover:scale-110"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  Email
                </span>
                <span className="text-sm text-foreground/60">
                  Questions, collaborations, or just to say hello
                </span>
              </div>
              <span className="shrink-0 px-4 py-2 text-sm font-medium">
                {EMAIL}
              </span>
            </a>
          ) : (
            <div className="glass-card flex items-center justify-between gap-6">
              Coming soon
            </div>
          )}
        </ScrollReveal>
      </section>
    </main>
  );
}
