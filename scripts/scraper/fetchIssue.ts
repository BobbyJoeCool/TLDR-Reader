/**
 * fetchIssue.ts
 *
 * Responsible for fetching the raw HTML of a single TLDR newsletter edition
 * for a given date. All three failure modes (network error, non-OK response,
 * redirect to newsletter root) return null so the caller treats them uniformly
 * as "not published today."
 */

import { BASE_URL } from "../config/newsletters";

/**
 * Fetches the HTML for one TLDR newsletter edition on a specific date.
 *
 * URL pattern: `https://tldr.tech/{slug}/{date}`
 * Example:     `https://tldr.tech/ai/2026-06-27`
 *
 * Returns null when:
 *   1. The network request throws (e.g. DNS failure, timeout).
 *   2. The server returns a non-2xx status code.
 *   3. The final URL after redirects no longer contains the requested date —
 *      TLDR's signal that no issue was published that day is a redirect back
 *      to the newsletter's root page (e.g. tldr.tech/ai), which strips the date
 *      from the URL.
 *
 * @param slug - URL path segment identifying the edition (e.g. "ai", "tech").
 * @param date - Publication date in YYYY-MM-DD format.
 * @returns Raw HTML string on success, or `null` if the issue is unavailable.
 */
export async function fetchIssue(slug: string, date: string): Promise<string | null> {
  const url = `${BASE_URL}/${slug}/${date}`;
  try {
    const res = await fetch(url, {
      // Identify ourselves as an archiver — some servers block the default Node fetch UA.
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TLDR-Archiver/1.0)" },
    });

    if (!res.ok) return null;

    // After following redirects, `res.url` is the final landing URL.
    // If TLDR has no issue for this date it redirects to the edition root
    // (e.g. tldr.tech/ai), dropping the date from the path. Detecting the
    // absence of the date string is the reliable "no issue today" signal.
    if (!res.url.includes(date)) return null;

    return await res.text();
  } catch {
    // Network-level failure (DNS, timeout, connection refused, etc.)
    return null;
  }
}
