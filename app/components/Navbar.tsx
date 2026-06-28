"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/app/components/theme/ThemeToggle";
import { logout } from "@/app/lib/auth/actions";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/events", label: "Events" },
  { path: "/statements", label: "Statements" },
  { path: "/publications", label: "Publications"},
  { path: "/about", label: "About" },
];

const adminLinks = [
  { path: "/admin/pages", label: "Pages" },
  { path: "/admin/events", label: "Events" },
  { path: "/admin/statements", label: "Statements" },
  { path: "/admin/publications", label: "Publications" },
  { path: "/admin/members", label: "Team", reviewerOnly: true },
  { path: "/admin/invites", label: "Invites", reviewerOnly: true },
];

type Role = "EXEC" | "PRESIDENT" | "OWNER";
type AdminSession = { email: string; role: Role } | null;

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [admin, setAdmin] = useState<AdminSession>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const adminRef = useRef<HTMLDivElement>(null);

  const visibleLinks = navLinks;

  // Reviewer-only items (Team, Invites) are hidden from execs.
  const reviewer = admin?.role === "PRESIDENT" || admin?.role === "OWNER";
  const visibleAdminLinks = adminLinks.filter(
    (l) => !l.reviewerOnly || reviewer
  );

  // Check admin status client-side so the public layout stays statically
  // rendered (the cookie is read by the /api/admin-session route instead).
  useEffect(() => {
    let active = true;
    fetch("/api/admin-session")
      .then((r) => (r.ok ? r.json() : { admin: false }))
      .then((data) => {
        if (active) setAdmin(data.admin ? { email: data.email, role: data.role } : null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [pathname]);

  // Close the desktop dropdown on outside click.
  useEffect(() => {
    if (!adminOpen) return;
    function onClick(e: MouseEvent) {
      if (adminRef.current && !adminRef.current.contains(e.target as Node)) {
        setAdminOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [adminOpen]);

  return (
    <nav className="glass-strong fixed top-0 left-0 right-0 z-50 px-6 py-3 backdrop-blur-md rounded-3xl border-b border-white/10 ml-10 mr-10 mt-5 mb-10">
      <div className="mx-auto flex max-w-7xl items-center">
        {/* Brand — flex-1 + justify-start keeps it left */}
        <div className="flex flex-1 justify-start">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/navbar/Lion_and_Sun.svg.png"
              alt="LSSA"
              className="h-8 w-auto [filter:_drop-shadow(1px_1px_1px_rgb(0_0_0_/_50%))]"
            />
            <div className="flex flex-col items-start">
              <span className="text-iran-yellow font-caslon text-lg font-bold tracking-tight leading-none [text-shadow:_0.1px_0.5px_1px_rgb(0_0_0_/_50%)]">
                Lion and Sun
              </span>
              <span className="text-iran-yellow font-caslon text-lg font-bold tracking-tight leading-none [text-shadow:_0.1px_0.5px_1px_rgb(0_0_0_/_50%)]">
                Student Association
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop links — no flex-1, just centered naturally between two equal sides */}
        <div className="hidden items-center gap-8 md:flex">
          {visibleLinks.map((link) => (
            <Link
              key={link.path}
              className={`text-sm font-medium transition-colors ${
                pathname === link.path ? "text-foreground" : "text-muted hover:text-foreground"
              }`}
              href={link.path}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth + theme toggle — flex-1 + justify-end keeps it right */}
        <div className="hidden flex-1 justify-end items-center gap-3 md:flex">
          {admin && (
            <div className="relative" ref={adminRef}>
              <button
                type="button"
                onClick={() => setAdminOpen((o) => !o)}
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin")
                    ? "text-accent"
                    : "text-muted hover:text-foreground"
                }`}
                aria-haspopup="menu"
                aria-expanded={adminOpen}
              >
                Admin
                <svg
                  className={`h-4 w-4 transition-transform ${adminOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {adminOpen && (
                <div
                  role="menu"
                  className="glass-strong absolute right-0 mt-3 flex w-48 flex-col gap-1 rounded-2xl p-2 shadow-xl"
                >
                  {admin.email && (
                    <span className="truncate px-3 py-1 text-xs text-muted">
                      {admin.email}
                    </span>
                  )}
                  {visibleAdminLinks.map((link) => (
                    <Link
                      key={link.path}
                      href={link.path}
                      role="menuitem"
                      onClick={() => setAdminOpen(false)}
                      className={`rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/10 ${
                        pathname === link.path ? "text-foreground" : "text-muted"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <form action={logout} className="contents">
                    <button
                      type="submit"
                      role="menuitem"
                      className="rounded-lg px-3 py-2 text-left text-sm text-muted transition-colors hover:bg-white/10 hover:text-foreground"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile hamburger */}
        <button
          className="text-foreground md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mt-3 flex flex-col gap-3 border-t border-white/10 pt-4 md:hidden">
          {visibleLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setMobileOpen(false)}
              className={`text-sm font-medium transition-colors text-left ${
                pathname === link.path ? "text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {admin && (
            <div className="mt-1 flex flex-col gap-3 border-t border-white/10 pt-3">
              <span className="text-xs uppercase tracking-wide text-muted/70">
                Admin
              </span>
              {visibleAdminLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-medium transition-colors text-left ${
                    pathname === link.path ? "text-foreground" : "text-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <form action={logout}>
                <button
                  type="submit"
                  className="text-left text-sm font-medium text-muted transition-colors hover:text-foreground"
                >
                  Sign out
                </button>
              </form>
            </div>
          )}

          <div className="mt-2 flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      )}
    </nav>
  );
}
