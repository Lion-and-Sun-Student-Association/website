import Link from "next/link";
import EventForm from "../EventForm";

export const metadata = { title: "New event — Admin" };

export default function NewEventPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/admin/events"
          className="text-sm text-muted hover:text-foreground"
        >
          ← Events
        </Link>
        <h1 className="font-caslon text-2xl font-bold">New event</h1>
      </div>
      <EventForm />
    </div>
  );
}
