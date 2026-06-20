import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import Papa from "papaparse";

export interface NameEntry {
  en: string;
  fa: string;
}

// Only the columns the client needs. The full CSV stays on the server.
interface VictimRow {
  "English Name"?: string;
  "Persian Name"?: string;
}

const CSV_PATH = path.join(process.cwd(), "data", "victims.csv");

/**
 * Reads victims.csv, parses it with a real CSV parser (handles commas and
 * newlines inside quoted fields), and returns just the names.
 *
 * Wrapped in React `cache` so the file is read and parsed once per request,
 * no matter how many components call it.
 */
export const getNames = cache(async (): Promise<NameEntry[]> => {
  const file = await readFile(CSV_PATH, "utf8");

  const { data } = Papa.parse<VictimRow>(file, {
    header: true,
    skipEmptyLines: true,
  });

  return data
    .map((row) => ({
      en: row["English Name"]?.trim() ?? "",
      fa: row["Persian Name"]?.trim() ?? "",
    }))
    // English is the base name; drop rows missing it entirely.
    .filter((entry) => entry.en.length > 0);
});
