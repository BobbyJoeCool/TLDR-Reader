/**
 * fetchIssue.ts
 *
 * Responsible for fetching the raw HTML of a single TLDR newsletter edition
 * for a given date.
 *
 * The result separates "TLDR didn't publish this edition today" (a normal,
 * expected outcome) from "we couldn't get the page" (network failure, blocked
 * request, rate limit, bad slug). Before this split, both came back as null,
 * so an environment that couldn't reach tldr.tech at all reported every
 * edition as "not published" — indistinguishable from a holiday.
 */

import { BASE_URL } from "../config/newsletters";

/** Outcome of fetching one edition/date. */
export type FetchResult =
  /** Page loaded and is the dated issue. */
  | { kind: "ok"; html: string }
  /** TLDR redirected away from the dated URL — no issue that day. */
  | { kind: "not-published" }
  /** The page could not be retrieved. `reason` is a short human-readable cause. */
  | { kind: "error"; reason: string };

/**
 * Fetches the HTML for one TLDR newsletter edition on a specific date.
 *
 * URL pattern: `https://tldr.tech/{slug}/{date}`
 * Example:     `https://tldr.tech/ai/2026-06-27`
 *
 * Classification:
 *   - 2xx and final URL still contains the date → `ok`
 *   - 2xx but final URL no longer contains the date → `not-published`
 *     (TLDR's no-issue signal is a redirect to the site or edition root;
 *     e.g. tldr.tech/tech/2026-11-15, a Sunday, lands on https://tldr.tech/)
 *   - any non-2xx status → `error` with the HTTP status
 *     (403/429 usually mean the request was blocked or rate-limited;
 *     404 means the edition slug in config/newsletters.ts is wrong)
 *   - fetch throws (DNS, timeout, connection refused, sandbox egress block)
 *     → `error` with the underlying message
 *
 * @param slug - URL path segment identifying the edition (e.g. "ai", "tech").
 * @param date - Publication date in YYYY-MM-DD format.
 */
export async function fetchIssue(slug: string, date: string): Promise<FetchResult> {
  const url = `${BASE_URL}/${slug}/${date}`;

  let res: Response;
  try {
    res = await fetch(url, {
      // Identify ourselves as an archiver — some servers block the default Node fetch UA.
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TLDR-Archiver/1.0)" },
      // Don't let a hung connection stall the whole run.
      signal: AbortSignal.timeout(30_000),
    });
  } catch (e) {
    // Node's fetch wraps the real cause (e.g. ENOTFOUND, ECONNREFUSED) in `cause`.
    const err = e as Error & { cause?: { code?: string; message?: string } };
    const detail = err.cause?.code ?? err.cause?.message ?? err.message;
    return { kind: "error", reason: `network error: ${detail}` };
  }

  if (!res.ok) {
    return { kind: "error", reason: `HTTP ${res.status}${res.statusText ? " " + res.statusText : ""}` };
  }

  // After following redirects, `res.url` is the final landing URL. If it no
  // longer contains the date, TLDR bounced us to a root page: no issue today.
  if (!res.url.includes(date)) return { kind: "not-published" };

  return { kind: "ok", html: await res.text() };
}
