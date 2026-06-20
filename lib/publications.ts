/**
 * Join a list of author names into a human byline:
 *   []            → ""
 *   ["A"]         → "A"
 *   ["A","B"]     → "A and B"
 *   ["A","B","C"] → "A, B, and C"
 */
export function formatAuthors(authors: string[]): string {
  const names = authors.map((a) => a.trim()).filter(Boolean);
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}
