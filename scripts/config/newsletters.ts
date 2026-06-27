/**
 * newsletters.ts
 *
 * Single source of truth for all TLDR newsletter editions.
 * Every other module imports from here — nothing hardcodes slugs or filenames directly.
 *
 * Fields per entry:
 *   slug  — URL path segment used on tldr.tech (e.g. "ai" → tldr.tech/ai/YYYY-MM-DD)
 *   name  — Human-readable edition label written into the JSON output
 *   file  — Output filename inside the per-day archive directory
 */

/** Root URL for all TLDR newsletter pages. */
export const BASE_URL = "https://tldr.tech";

/**
 * Ordered list of every TLDR edition the scraper knows about.
 * Add a new entry here when TLDR launches a new newsletter — no other file needs to change.
 */
export const EDITIONS = [
  { slug: "tech",      name: "TLDR",           file: "tldr.json" },
  { slug: "ai",        name: "TLDR AI",         file: "tldr-ai.json" },
  { slug: "dev",       name: "TLDR Dev",        file: "tldr-dev.json" },
  { slug: "devops",    name: "TLDR DevOps",     file: "tldr-devops.json" },
  { slug: "product",   name: "TLDR Product",    file: "tldr-product.json" },
  { slug: "it",        name: "TLDR IT",         file: "tldr-it.json" },
  { slug: "infosec",   name: "TLDR InfoSec",    file: "tldr-infosec.json" },
  { slug: "founders",  name: "TLDR Founders",   file: "tldr-founders.json" },
  { slug: "design",    name: "TLDR Design",     file: "tldr-design.json" },
  { slug: "marketing", name: "TLDR Marketing",  file: "tldr-marketing.json" },
  { slug: "crypto",    name: "TLDR Crypto",     file: "tldr-crypto.json" },
  { slug: "fintech",   name: "TLDR Fintech",    file: "tldr-fintech.json" },
  { slug: "data",      name: "TLDR Data",       file: "tldr-data.json" },
  { slug: "hardware",  name: "TLDR Hardware",   file: "tldr-hardware.json" },
];
