import Link from "next/link";
import PublicationForm from "../PublicationForm";

export const metadata = { title: "New publication — Admin" };

export default function NewPublicationPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/admin/publications"
          className="text-sm text-muted hover:text-foreground"
        >
          ← Publications
        </Link>
        <h1 className="font-caslon text-2xl font-bold">New publication</h1>
      </div>
      <PublicationForm />
    </div>
  );
}
