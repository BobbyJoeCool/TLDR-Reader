/**
 * writeEdition.ts
 *
 * Writes the parsed articles for one newsletter edition to the archive.
 * Creates the day directory if it doesn't exist yet, then writes (or overwrites)
 * the edition JSON file. This module only touches the filesystem — no git, no manifests.
 */

import * as fs from "fs";
import * as path from "path";
import type { Article } from "../scraper/parseIssue";

/**
 * Absolute path to the archive root, resolved relative to this file's location.
 * `__dirname` is `scripts/archive/`, so `../../public/data/archive` lands at the
 * repository root's `public/data/archive/` directory.
 */
const ARCHIVE_ROOT = path.resolve(__dirname, "../../public/data/archive");

/**
 * Writes one edition's articles to disk as a JSON file.
 *
 * Output path: `public/data/archive/{year}/{date}/{edition.file}`
 * Example:     `public/data/archive/2026/2026-06-27/tldr-ai.json`
 *
 * Output shape:
 * ```json
 * {
 *   "name": "TLDR AI",
 *   "date": "2026-06-27",
 *   "articleCount": 12,
 *   "source": "TLDR",
 *   "articles": [{ "url": "…", "title": "…", "summary": "…" }, …]
 * }
 * ```
 *
 * The day directory is created if it does not already exist. An existing file
 * for the same edition and date is silently overwritten (idempotent).
 *
 * @param articles - Parsed articles from `parseIssue`.
 * @param edition  - Edition metadata (`name` for the JSON field, `file` for the filename).
 * @param date     - Publication date in YYYY-MM-DD format.
 */
export function writeEdition(
  articles: Article[],
  edition: { name: string; file: string },
  date: string
): void {
  // Extract the four-digit year to build the two-level directory path.
  const year = date.slice(0, 4);
  const dayDir = path.join(ARCHIVE_ROOT, year, date);

  // Create the full directory tree in one call; { recursive: true } is a no-op
  // if the directories already exist, so this is safe to call on every run.
  fs.mkdirSync(dayDir, { recursive: true });

  const payload = {
    name: edition.name,
    date,
    articleCount: articles.length, // redundant with articles.length but convenient for consumers
    source: "TLDR",
    articles,
  };

  // Write with 2-space indentation and a trailing newline for clean git diffs.
  fs.writeFileSync(path.join(dayDir, edition.file), JSON.stringify(payload, null, 2) + "\n");
}
