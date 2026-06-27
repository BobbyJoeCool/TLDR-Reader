/**
 * isSponsored.ts
 *
 * Single-purpose predicate that identifies article titles that should be
 * filtered out before being written to the archive.
 *
 * Kept isolated so the blocklist can be extended without touching the parser.
 */

/**
 * Returns true if the given article title belongs to a sponsored or
 * promotional item that should be excluded from the archive.
 *
 * Catches:
 *   - "sponsor"  → matches "(Sponsor", "(Sponsored)", "Sponsored by", etc.
 *                  No closing parenthesis required — any title containing the
 *                  word is discarded.
 *   - "hiring"   → matches job listing blurbs like "We're Hiring" or
 *                  "(Hiring) Senior Engineer at …"
 *
 * @param title - Raw heading text from the newsletter page.
 * @returns `true` if the title should be skipped; `false` if it's a real article.
 */
export function isSponsored(title: string): boolean {
  const lower = title.toLowerCase();
  return lower.includes("sponsor") || lower.includes("hiring");
}
