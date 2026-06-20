// Single source of truth for languages. Add "fa" here when you're ready for Persian.
export const locales = ["en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

// Text direction per language. Persian is right-to-left.
export const direction: Record<string, "ltr" | "rtl"> = {
  en: "ltr",
  fa: "rtl",
};
