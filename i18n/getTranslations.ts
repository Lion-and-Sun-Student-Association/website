import { defaultLocale, type Locale } from "./config";
import en from "@/messages/en.json";

// Add new locales here as you create their message files: { en, fa }.
const dictionaries = { en } as const;

type Messages = (typeof dictionaries)[typeof defaultLocale];
type Namespace = keyof Messages;

/**
 * Lightweight stand-in for next-intl's `getTranslations`.
 * Usage: const t = getTranslations("Home"); t("welcome")
 *
 * When you adopt next-intl, swap this import for `next-intl/server`
 * and add `await` + the active locale — the call sites stay the same.
 */
export function getTranslations<N extends Namespace>(
  namespace: N,
  locale: Locale = defaultLocale
) {
  const messages = dictionaries[locale][namespace];
  return (key: keyof Messages[N]) => messages[key] as string;
}
