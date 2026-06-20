"use client";

import { usePathname } from "next/navigation";
import NameBackground from "@/app/components/NameBackground";
import GradientBackdrop from "@/app/components/GradientBackdrop";
import { defaultLocale } from "@/i18n/config";
import type { NameEntry } from "@/lib/getNames";

/**
 * Conditionally renders the animated name background and gradient backdrop
 * only on public pages (not /admin/*). Used in the root layout.
 */
export default function PublicBackdrop({ names }: { names: NameEntry[] }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  if (isAdminPage) return null;

  // On the home page the names stay hidden through the hero and only appear
  // once the visitor scrolls past it. On every other page they show right away.
  const gateScroll = pathname === "/";

  return (
    <>
      <GradientBackdrop />
      <NameBackground names={names} locale={defaultLocale} gateScroll={gateScroll} />
    </>
  );
}
