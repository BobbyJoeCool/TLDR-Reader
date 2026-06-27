/**
 * parseIssue.ts
 *
 * Extracts article data from a raw TLDR newsletter HTML page using Cheerio
 * (a server-side jQuery-like DOM traversal library).
 *
 * TLDR page structure (relevant portion):
 *   <h3>
 *     <a href="https://...">Article Title (4 minute read)</a>
 *   </h3>
 *   <p>One-paragraph summary of the article.</p>
 *
 * Each <h3> + following <p> pair is one article. Sponsored items also follow
 * this pattern but are identified by their heading text.
 */

import * as cheerio from "cheerio";
import { isSponsored } from "./isSponsored";

/**
 * Represents a single parsed article extracted from a newsletter page.
 * Only the three fields the React app needs are retained — all other
 * metadata present in the raw HTML is intentionally discarded.
 */
export interface Article {
  /** Canonical URL the article title links to. */
  url: string;
  /** Clean article title with read-time suffix removed. */
  title: string;
  /** One-paragraph plain-text summary from the newsletter. */
  summary: string;
}

/**
 * Parses raw HTML from a TLDR newsletter page and returns all real articles.
 *
 * Scanning strategy:
 *   - Iterates every <h3> element on the page (TLDR uses <h3> for article headings).
 *   - For each heading, looks for the first <a> child that has an absolute URL.
 *   - Skips headings with no link, sponsored/hiring content, relative URLs,
 *     or where the cleaned title or following summary paragraph is empty.
 *
 * @param html - Raw HTML string returned by `fetchIssue`.
 * @returns Array of parsed articles, or `null` if zero articles survived filtering.
 *          `null` (not `[]`) lets callers distinguish "parsed but empty" from a
 *          fetch failure without a separate boolean flag.
 */
export function parseIssue(html: string): Article[] | null {
  const $ = cheerio.load(html);
  const articles: Article[] = [];

  // Walk every <h3> on the page — TLDR article headings are always <h3>.
  $("h3").each((_, el) => {
    const h3 = $(el);

    // Grab the first anchor inside this heading. TLDR wraps the article title
    // in a single <a>; if there's no link, it's a section header, not an article.
    const a = h3.find("a").first();
    if (!a.length) return; // skip — no link found

    // Check the full heading text (including any surrounding spans) against the
    // sponsored/hiring blocklist before doing any further work.
    const titleText = h3.text().trim();
    if (isSponsored(titleText)) return; // skip — promotional content

    const href = a.attr("href") ?? "";

    // Reject relative paths and anchor-only links (e.g. "#section").
    // All real article URLs start with "http".
    if (!href.startsWith("http")) return;

    // Strip the read-time annotation that TLDR appends to every title.
    // Regex breakdown:
    //   \s*          — optional leading whitespace before the parenthesis
    //   \(           — literal opening parenthesis
    //   \d+          — one or more digits (the minute count, e.g. "4")
    //   \s+          — one or more spaces
    //   minute\s+read — the literal words "minute read"
    //   \)           — literal closing parenthesis
    //   \s*          — optional trailing whitespace
    //   $            — must appear at the very end of the string
    //   /i           — case-insensitive (handles "Minute Read", etc.)
    // Example: "Why Rust Is Taking Over Systems (4 minute read)" → "Why Rust Is Taking Over Systems"
    const title = a.text().replace(/\s*\(\d+\s+minute\s+read\)\s*$/i, "").trim();

    // The summary is the <p> element that immediately follows the <h3> in the DOM.
    // Cheerio's .next("p") returns only the directly adjacent sibling paragraph,
    // not any paragraph further down the page.
    const summary = h3.next("p").text().trim();

    // Skip articles where either field is empty after trimming — this guards
    // against malformed entries and section dividers that have no body text.
    if (!title || !summary) return;

    articles.push({ url: href, title, summary });
  });

  // Return null rather than an empty array so callers can distinguish
  // "page loaded but had no real articles" from a network/fetch failure.
  return articles.length > 0 ? articles : null;
}
