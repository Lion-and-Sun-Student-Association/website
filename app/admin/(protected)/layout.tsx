import { requireAdmin } from "@/app/lib/auth/server";

/**
 * Gates every route in the (protected) group. Navigation (Pages / Invites /
 * Sign out) lives in the global Navbar's Admin dropdown, so this layout only
 * enforces access and pads content below the fixed navbar.
 *
 * The login page lives at /admin/login — OUTSIDE this group — so
 * requireAdmin()'s redirect can't loop.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 pb-12 pt-40">
      {children}
    </main>
  );
}
