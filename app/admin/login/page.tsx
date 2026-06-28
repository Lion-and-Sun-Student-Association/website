import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/lib/auth/server";
import { isTeamRole } from "@/app/lib/auth/roles";
import LoginForm from "./LoginForm";

export const metadata = { title: "Admin sign in" };

export default async function AdminLoginPage() {
  // Already signed in as an admin? Skip the form.
  const user = await getSessionUser();
  if (user && isTeamRole(user.role)) {
    redirect("/admin/pages");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <h1 className="font-caslon text-2xl font-bold">Admin sign in</h1>
      <LoginForm />
    </main>
  );
}
