#!/usr/bin/env npx tsx
/**
 * ingestToday.ts
 *
 * Top-level CLI entry point and pipeline orchestrator for the TLDR archiver.
 *
 * Usage:
 *   npx tsx scripts/jobs/ingestToday.ts              # scrapes today's date
 *   npx tsx scripts/jobs/ingestToday.ts 2026-06-27   # scrapes a specific date
 *   npm run ingest                                    # alias defined in package.json
 *
 * Pipeline (runs sequentially):
 *   1. Determine the target date (CLI arg or today).
 *   2. For each edition in EDITIONS: fetch → parse → write JSON file.
 *   3. Write the day's manifest.json listing all editions that produced articles.
 *   4. Update the year-level manifest to register the day.
 *   5. git add / commit / push the new archive files.
 *
 * Exit codes:
 *   0 — at least one edition scraped and pushed (any per-edition fetch
 *       failures are listed in a "⚠" warning line before exit)
 *   1 — no editions produced articles and no fetches failed (a genuine quiet
 *       day: weekend/holiday), OR the git push failed
 *   2 — no editions written AND one or more fetches failed. This means the
 *       environment couldn't reach tldr.tech (blocked, rate-limited, offline),
 *       NOT that nothing was published.
 */

import { execSync } from "child_process";
import * as path from "path";
import { EDITIONS } from "../config/newsletters";
import { fetchIssue } from "../scraper/fetchIssue";
import { parseIssue } from "../scraper/parseIssue";
import { writeEdition } from "../archive/writeEdition";
import { writeDailyManifest } from "../archive/writeDailyManifest";
import { writeYearManifest } from "../archive/writeYearManifest";

/**
 * Reads the target date from the command-line or defaults to today (UTC).
 *
 * Accepts an optional first argument in YYYY-MM-DD format.
 * Regex breakdown:
 *   ^         — start of string (no leading characters allowed)
 *   \d{4}     — exactly four digits for the year
 *   -         — literal hyphen separator
 *   \d{2}     — exactly two digits for the month (01–12)
 *   -         — literal hyphen separator
 *   \d{2}     — exactly two digits for the day (01–31)
 *   $         — end of string (no trailing characters allowed)
 * If the argument is missing or doesn't match this pattern, falls back to today.
 *
 * @returns Date string in YYYY-MM-DD format.
 */
function getDate(): string {
  const arg = process.argv[2]; // first user-supplied argument after the script name
  if (arg && /^\d{4}-\d{2}-\d{2}$/.test(arg)) return arg;

  // toISOString() produces "YYYY-MM-DDTHH:mm:ss.sssZ"; split on "T" gives the date portion.
  return new Date().toISOString().split("T")[0];
}

/**
 * Main pipeline. Runs each edition serially (not in parallel) so the console
 * output stays readable and we don't hammer tldr.tech with concurrent requests.
 */
async function main() {
  const date = getDate();
  console.log(`\nScraping TLDR editions for ${date}...\n`);

  // Accumulates metadata for every edition successfully written to disk.
  // Only these editions will appear in the daily manifest.
  const written: { name: string; file: string }[] = [];

  // Editions whose page couldn't be retrieved at all (network error, 403, 429…).
  // Kept separate from "not published" so a blocked run isn't mistaken for a holiday.
  const failed: { name: string; reason: string }[] = [];

  for (const edition of EDITIONS) {
    // padEnd(20) right-pads the edition name to 20 characters so the status
    // columns (✓, —) line up neatly across all 14 editions in the console output.
    process.stdout.write(`  ${edition.name.padEnd(20)}`);

    // Step 1: fetch raw HTML.
    const result = await fetchIssue(edition.slug, date);
    if (result.kind === "not-published") { console.log("— not published"); continue; }
    if (result.kind === "error") {
      console.log(`✗  fetch failed (${result.reason})`);
      failed.push({ name: edition.name, reason: result.reason });
      continue;
    }

    // Step 2: extract articles from the HTML. Returns null if zero real articles
    // survived filtering (empty page or all items were sponsored).
    const articles = parseIssue(result.html);
    if (!articles) { console.log("— no articles"); continue; }

    // Step 3: persist the edition JSON to disk.
    writeEdition(articles, edition, date);
    written.push({ name: edition.name, file: edition.file });
    console.log(`✓  ${articles.length} articles`);

    // Step 4: pause before the next request to avoid triggering TLDR's
    // rate limiter. Without a delay, rapid sequential fetches occasionally
    // receive a redirect-to-root response, causing editions to be silently
    // skipped. 1 second is enough; 14 editions adds ~14s to the total runtime.
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // If nothing was written, decide whether it was a quiet day or a broken run.
  // Exit non-zero either way so the calling process (CI, cron, agent) can detect it.
  if (written.length === 0) {
    if (failed.length > 0) {
      console.log(
        `\nFETCH FAILED — ${failed.length} of ${EDITIONS.length} editions could not be retrieved ` +
        `(first error: ${failed[0].reason}). This is a connectivity/blocking problem, ` +
        `not a day without newsletters. Nothing written.`
      );
      process.exit(2);
    }
    console.log("\nNo editions published — nothing written.");
    process.exit(1);
  }

  // Partial failure: still archive what we got, but make the gap visible.
  if (failed.length > 0) {
    console.log(`\n⚠ ${failed.length} edition(s) failed to fetch: ` +
      failed.map((f) => `${f.name} (${f.reason})`).join(", "));
  }

  // Step 4: write the day manifest listing every edition that produced articles.
  writeDailyManifest(date, written);
  console.log(`\nWrote manifest.json (${written.length} editions)`);

  // Step 5: register this date in the rolling year-level manifest.
  writeYearManifest(date);
  console.log(`Updated manifest-${date.slice(0, 4)}.json`);

  // Step 6: stage, commit, and push all new archive files in one atomic commit.
  // `cwd: repoRoot` ensures git commands run from the repository root regardless
  // of where the script was invoked from.
  const repoRoot = path.resolve(__dirname, "../..");
  try {
    // Stage only the archive directory — avoids accidentally committing unrelated
    // working-tree changes that might be present during development.
    execSync("git add public/data/archive", { cwd: repoRoot, stdio: "inherit" });

    execSync(`git commit -m "chore: update TLDR archive for ${date}"`, {
      cwd: repoRoot,
      stdio: "inherit",
    });

    execSync("git push", { cwd: repoRoot, stdio: "inherit" });
    console.log("\n✓ Pushed to git");
  } catch (e) {
    console.error("\n✗ Git push failed:", e);
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
