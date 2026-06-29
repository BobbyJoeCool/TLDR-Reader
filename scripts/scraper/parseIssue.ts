/**
 * parseIssue.ts
 *
 * Extracts article data from a raw TLDR newsletter HTML page using Cheerio
 * (a server-side jQuery-like DOM traversal library).
 *
 * TLDR page structure (relevant portion, current as of 2026):
 *   <article>
 *     <a class="font-bold" href="https://...">
 *       <h3>Article Title (4 minute read)</h3>
 *     </a>
 *     <div class="newsletter-html">One-paragraph summary of the article.</div>
 *   </article>
 *
 * Previous structure (pre-2026, kept for reference):
 *   <h3>
 *     <a href="https://...">Article Title (4 minute read)</a>
 *   </h3>
 *   <p>One-paragraph summary of the article.</p>
 *
 * Each <h3> is one article. Section headers also use <h3> but are not wrapped
 * in an <a> tag, so they are naturally skipped.
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
 *   - Each article <h3> is a child of an <a> tag (section headers are plain <h3>s
 *     with no parent <a>, so they are naturally skipped).
 *   - The summary is in a sibling <div class="newsletter-html"> of the parent <a>.
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

    // Support two HTML structures TLDR has used:
    //
    // Current (2026+): <a href="..."><h3>Title</h3></a>
    //                  <div class="newsletter-html">Summary</div>
    //   — The <h3> is a child of the <a>; summary is in a sibling div.
    //
    // Legacy (pre-2026): <h3><a href="...">Title</a></h3>
    //                    <p>Summary</p>
    //   — The <a> is a child of the <h3>; summary is in the next sibling <p>.

    let href: string;
    let titleSource: import("cheerio").Cheerio<import("cheerio").Element>;
    let summary: string;

    const parentA = h3.parent("a");
    const childA = h3.find("a").first();

    if (parentA.length) {
      // Current structure: <a href="..."><h3>...</h3></a>
      href = parentA.attr("href") ?? "";
      titleSource = h3;
      summary = parentA.next("div.newsletter-html").text().trim();
    } else if (childA.length) {
      // Legacy structure: <h3><a href="...">...</a></h3>
      href = childA.attr("href") ?? "";
      titleSource = childA;
      summary = h3.next("p").text().trim();
    } else {
      return; // skip — no link found (section header or other element)
    }

    // Check heading text against the sponsored/hiring blocklist.
    const titleText = h3.text().trim();
    if (isSponsored(titleText)) return; // skip — promotional content

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
    const title = titleSource.text().replace(/\s*\(\d+\s+minute\s+read\)\s*$/i, "").trim();

    // Skip articles where either field is empty after trimming.
    if (!title || !summary) return;

    articles.push({ url: href, title, summary });
  });

  // Return null rather than an empty array so callers can distinguish
  // "page loaded but had no real articles" from a network/fetch failure.
  return articles.length > 0 ? articles : null;
}
