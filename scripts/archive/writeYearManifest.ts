/**
 * writeYearManifest.ts
 *
 * Maintains the rolling year-level index (`manifest-{year}.json`) that the
 * React app loads once on startup to know which weeks and dates have data.
 *
 * The manifest is an array of week objects, newest week first. Each week
 * records which weekdays (monday–friday) have a date string. Days with no
 * issue (gaps, weekends) are simply absent from the `days` object.
 *
 * Historical week entries are never modified — only the current week is updated.
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
 * Returns the Monday (start of the ISO week) for the given date as YYYY-MM-DD.
 *
 * Why `T12:00:00Z` (noon UTC):
 *   Parsing a bare date string like "2026-06-27" without a time component
 *   makes JavaScript treat it as midnight UTC. In time zones behind UTC this
 *   rolls back to the previous calendar day, which would shift the week
 *   calculation by one day. Using noon UTC as the anchor keeps the date
 *   stable regardless of the local timezone of the machine running the script.
 *
 * Monday offset calculation:
 *   `getUTCDay()` returns 0 (Sunday) through 6 (Saturday).
 *   To back up to the preceding Monday:
 *     - Sunday (0): subtract 6 days  → the Monday six days earlier
 *     - Any other day (1–6): subtract (day - 1) days  → the Monday of that week
 *   Written as a ternary: `day === 0 ? -6 : 1 - day`
 *
 * @param dateStr - Date in YYYY-MM-DD format.
 * @returns The Monday of the same ISO week, in YYYY-MM-DD format.
 */
function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z"); // anchor at noon UTC to avoid timezone drift
  const day = d.getUTCDay(); // 0 = Sunday, 1 = Monday, …, 6 = Saturday

  // Days to subtract to reach the previous (or same-day) Monday.
  // Sunday is the special case: it needs to go back 6 days rather than forward 1.
  const diff = day === 0 ? -6 : 1 - day;

  const mon = new Date(d);
  mon.setUTCDate(d.getUTCDate() + diff);

  // toISOString() returns "YYYY-MM-DDTHH:mm:ss.sssZ"; split on "T" to get just the date.
  return mon.toISOString().split("T")[0];
}

/**
 * Returns the lowercase weekday name for the given date.
 * Used as the key in the week's `days` object (e.g. `days.friday = "2026-06-27"`).
 *
 * The `T12:00:00Z` noon-UTC anchor is applied here for the same timezone-safety
 * reason as in `getWeekStart`.
 *
 * @param dateStr - Date in YYYY-MM-DD format.
 * @returns One of: "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday".
 */
function getDayName(dateStr: string): string {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return days[new Date(dateStr + "T12:00:00Z").getUTCDay()];
}

/**
 * Updates the year-level manifest to register a newly ingested date.
 *
 * Manifest path: `public/data/archive/manifest-{year}.json`
 * Example:       `public/data/archive/manifest-2026.json`
 *
 * Manifest shape:
 * ```json
 * {
 *   "year": 2026,
 *   "weeks": [
 *     {
 *       "weekStart": "2026-06-22",
 *       "days": {
 *         "monday":    "2026-06-22",
 *         "tuesday":   "2026-06-23",
 *         "wednesday": "2026-06-24",
 *         "thursday":  "2026-06-25",
 *         "friday":    "2026-06-26"
 *       }
 *     },
 *     … (older weeks follow, newest week always first)
 *   ]
 * }
 * ```
 *
 * Behavior:
 *   - If the file doesn't exist yet, initializes a fresh manifest for the year.
 *   - Finds the week object whose `weekStart` matches the Monday of `date`.
 *   - If no matching week exists, creates a new one and inserts it at position 0
 *     (`unshift`) so the newest week always appears first in the array.
 *   - Sets `week.days[dayName] = date` and saves the file.
 *   - Never modifies any week other than the one containing `date`.
 *
 * @param date - Publication date in YYYY-MM-DD format.
 */
export function writeYearManifest(date: string): void {
  const year = date.slice(0, 4);
  const manifestPath = path.join(ARCHIVE_ROOT, `manifest-${year}.json`);

  // Attempt to load the existing manifest; fall back to an empty skeleton if the
  // file doesn't exist yet (first scrape of a new year) or can't be parsed.
  let yearManifest: { year: number; weeks: any[] };
  try {
    yearManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    yearManifest = { year: Number(year), weeks: [] };
  }

  const weekStart = getWeekStart(date);
  const dayName = getDayName(date);

  // Locate the week entry for this date's Monday. `find` returns undefined if
  // this is the first day of a new week that hasn't been seen before.
  let week = yearManifest.weeks.find((w: any) => w.weekStart === weekStart);
  if (!week) {
    // New week — create it and prepend to keep the array newest-first.
    week = { weekStart, days: {} };
    yearManifest.weeks.unshift(week); // unshift inserts at index 0 (front of array)
  }

  // Record this date under its weekday name (e.g. days.friday = "2026-06-27").
  week.days[dayName] = date;

  // Write with 2-space indentation and a trailing newline for clean git diffs.
  fs.writeFileSync(manifestPath, JSON.stringify(yearManifest, null, 2) + "\n");
}
