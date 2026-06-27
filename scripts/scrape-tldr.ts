#!/usr/bin/env npx tsx
/**
 * scrape-tldr.ts
 * Scrapes all TLDR newsletter editions for a given date and writes
 * JSON archive files, updates manifests, and pushes to git.
 *
 * Usage:
 *   npx tsx scripts/scrape-tldr.ts [YYYY-MM-DD]
 *   (defaults to today if no date provided)
 */

import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

// ── Edition config ─────────────────────────────────────────────────────────

const EDITIONS = [
  { slug: "tech",      name: "TLDR",          file: "tldr.json" },
  { slug: "ai",        name: "TLDR AI",        file: "tldr-ai.json" },
  { slug: "dev",       name: "TLDR Dev",       file: "tldr-dev.json" },
  { slug: "devops",    name: "TLDR DevOps",    file: "tldr-devops.json" },
  { slug: "product",   name: "TLDR Product",   file: "tldr-product.json" },
  { slug: "it",        name: "TLDR IT",        file: "tldr-it.json" },
  { slug: "infosec",   name: "TLDR InfoSec",   file: "tldr-infosec.json" },
  { slug: "founders",  name: "TLDR Founders",  file: "tldr-founders.json" },
  { slug: "design",    name: "TLDR Design",    file: "tldr-design.json" },
  { slug: "marketing", name: "TLDR Marketing", file: "tldr-marketing.json" },
  { slug: "crypto",    name: "TLDR Crypto",    file: "tldr-crypto.json" },
  { slug: "fintech",   name: "TLDR Fintech",   file: "tldr-fintech.json" },
  { slug: "data",      name: "TLDR Data",      file: "tldr-data.json" },
  { slug: "hardware",  name: "TLDR Hardware",  file: "tldr-hardware.json" },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function getDate(): string {
  const arg = process.argv[2];
  if (arg && /^\d{4}-\d{2}-\d{2}$/.test(arg)) return arg;
  return new Date().toISOString().split("T")[0];
}

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  const day = d.getUTCDay(); // 0=Sun, 1=Mon ...
  const diff = day === 0 ? -6 : 1 - day; // back to Monday
  const mon = new Date(d);
  mon.setUTCDate(d.getUTCDate() + diff);
  return mon.toISOString().split("T")[0];
}

function getDayName(dateStr: string): string {
  const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
  return days[new Date(dateStr + "T12:00:00Z").getUTCDay()];
}

// ── Scraper ────────────────────────────────────────────────────────────────

interface Article {
  url: string;
  title: string;
  summary: string;
}

async function scrapeEdition(slug: string, date: string): Promise<Article[] | null> {
  const url = `https://tldr.tech/${slug}/${date}`;
  let html: string;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TLDR-Archiver/1.0)" },
    });
    if (!res.ok) return null;
    html = await res.text();
  } catch {
    return null;
  }

  const $ = cheerio.load(html);
  const articles: Article[] = [];

  $("h3").each((_, el) => {
    const h3 = $(el);
    const a = h3.find("a").first();

    // Skip sponsors and job listings
    const titleText = h3.text().trim();
    if (
      titleText.toLowerCase().includes("sponsor") ||
      titleText.toLowerCase().includes("hiring") ||
      !a.length
    ) return;

    const href = a.attr("href") || "";
    if (!href.startsWith("http")) return;

    // Clean title: strip read-time suffix like " (4 minute read)"
    const title = a.text().replace(/\s*\(\d+\s+minute\s+read\)\s*$/i, "").trim();

    // Summary is the next <p> sibling
    const summary = h3.next("p").text().trim();
    if (!title || !summary) return;

    articles.push({ url: href, title, summary });
  });

  return articles.length > 0 ? articles : null;
}

// ── Manifest helpers ───────────────────────────────────────────────────────

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function readJSON<T>(p: string, fallback: T): T {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return fallback; }
}

function writeJSON(p: string, data: unknown) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const date = getDate();
  const year = date.slice(0, 4);
  const root = path.resolve(__dirname, "../public/data/archive");
  const dayDir = path.join(root, year, date);
  ensureDir(dayDir);

  console.log(`\nScraping TLDR editions for ${date}...\n`);

  const processedEditions: { name: string; file: string }[] = [];

  for (const edition of EDITIONS) {
    process.stdout.write(`  ${edition.name.padEnd(20)}`);
    const articles = await scrapeEdition(edition.slug, date);

    if (!articles) {
      console.log("— not published");
      continue;
    }

    const payload = {
      name: edition.name,
      date,
      articleCount: articles.length,
      source: "TLDR",
      articles,
    };

    writeJSON(path.join(dayDir, edition.file), payload);
    processedEditions.push({ name: edition.name, file: edition.file });
    console.log(`✓  ${articles.length} articles`);
  }

  if (processedEditions.length === 0) {
    console.log("\nNo editions found — nothing written.");
    process.exit(1);
  }

  // ── Daily manifest ──────────────────────────────────────────────────────
  const manifestPath = path.join(dayDir, "manifest.json");
  writeJSON(manifestPath, {
    id: date,
    date,
    editions: processedEditions,
  });
  console.log(`\nWrote manifest.json (${processedEditions.length} editions)`);

  // ── Yearly manifest ─────────────────────────────────────────────────────
  const yearManifestPath = path.join(root, `manifest-${year}.json`);
  const yearManifest = readJSON<{ year: number; weeks: any[] }>(yearManifestPath, {
    year: Number(year),
    weeks: [],
  });

  const weekStart = getWeekStart(date);
  const dayName = getDayName(date);
  let week = yearManifest.weeks.find((w: any) => w.weekStart === weekStart);
  if (!week) {
    week = { weekStart, days: {} };
    yearManifest.weeks.unshift(week);
  }
  week.days[dayName] = date;
  writeJSON(yearManifestPath, yearManifest);
  console.log(`Updated manifest-${year}.json`);

  // ── Git push ────────────────────────────────────────────────────────────
  const repoRoot = path.resolve(__dirname, "..");
  try {
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
