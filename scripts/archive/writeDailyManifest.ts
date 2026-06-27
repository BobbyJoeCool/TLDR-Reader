/**
 * writeDailyManifest.ts
 *
 * Writes (or overwrites) the `manifest.json` for a single archive day.
 * This is the file React reads first when a user selects a date — it tells
 * the app which edition tabs to render and which JSON files to fetch.
 *
 * Only editions that produced at least one article are included; the caller
 * (ingestToday.ts) is responsible for passing only successful editions.
 */

import * as fs from "fs";
import * as path from "path";

/**
 * Absolute path to the archive root.
 * `__dirname` is `scripts/archive/`, so `../../public/data/archive` resolves
 * to the repository's `public/data/archive/` directory.
 */
const ARCHIVE_ROOT = path.resolve(__dirname, "../../public/data/archive");

/**
 * Writes the daily manifest for a given date.
 *
 * Output path: `public/data/archive/{year}/{date}/manifest.json`
 * Example:     `public/data/archive/2026/2026-06-27/manifest.json`
 *
 * Output shape:
 * ```json
 * {
 *   "id": "2026-06-27",
 *   "date": "2026-06-27",
 *   "editions": [
 *     { "name": "TLDR AI", "file": "tldr-ai.json" },
 *     …
 *   ]
 * }
 * ```
 *
 * The file is always fully overwritten — there is no merge/append logic.
 * Running the scraper twice for the same date produces the same output (idempotent).
 *
 * @param date     - Publication date in YYYY-MM-DD format.
 * @param editions - List of editions that were successfully scraped and written.
 *                   Each entry needs only `name` (display label) and `file` (filename).
 */
export function writeDailyManifest(
  date: string,
  editions: { name: string; file: string }[]
): void {
  // Extract the year to locate the correct subdirectory.
  const year = date.slice(0, 4);
  const manifestPath = path.join(ARCHIVE_ROOT, year, date, "manifest.json");

  // Write with 2-space indentation and a trailing newline for clean git diffs.
  fs.writeFileSync(
    manifestPath,
    JSON.stringify({ id: date, date, editions }, null, 2) + "\n"
  );
}
