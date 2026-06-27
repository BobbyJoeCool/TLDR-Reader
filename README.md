# TLDR Reader

A personal web app for reading, flagging, and saving articles from the [TLDR Newsletter](https://tldr.tech). Built for daily use on both mobile and desktop.

Live at: [https://happy-bush-0f619981e.7.azurestaticapps.net](https://happy-bush-0f619981e.7.azurestaticapps.net)

---

## Features

| Feature | Description |
| --- | --- |
| **This Week / Last Week** | Browse each day's TLDR editions, grouped by newsletter |
| **Archive** | Pick any past date from a calendar and read that day's articles |
| **Reading List** | Articles you've flagged for later, with read/unread tracking |
| **Saved Articles** | Permanently saved articles, organized by newsletter edition |
| **Landing Page** | Hub screen with navigation tiles and a quick usage guide |

---

## How to Use

### Navigating

Open the app and you'll land on the home screen. Use the navigation tiles (or the bottom nav on mobile / top nav on desktop) to move between sections:

- **Reading List** — your flagged articles
- **This Week** — the current week's editions, one day at a time
- **Last Week** — last week's editions
- **Archive** — any past date; grey dates have no articles
- **Saved Articles** — permanently saved articles

Tap **TLDR Reader** (desktop top bar, or the bar at the top of each page on mobile) to return to the home screen at any time. On mobile there is also a home icon button beside the logout button in the top-right corner.

---

### Flagging Articles (Reading List)

Tap the **flag icon** on any article card to add it to your Reading List.

- The flag turns purple when active.
- Flagged articles appear on the **Reading List** page grouped by edition and date.
- To remove an article from your Reading List, tap the **✕** button on its card in the Reading List.

---

### Marking Articles as Read

On the **Reading List** page, tap the **✓ checkmark** on any article card to mark it as read. The card will dim to indicate it has been read. Tap it again to mark as unread.

---

### Saving Articles

Tap the **star icon** on any article card (in any section) to save it permanently to your Saved Articles list.

- Saved articles persist across sessions and are stored in the cloud.
- The star turns gold/accent when active.
- To unsave, tap the star again from any view, or tap the filled star on the article in the **Saved Articles** page.

Saved Articles are grouped by newsletter edition (in canonical TLDR order) and sorted newest-to-oldest within each edition.

---

### The Archive

The Archive lets you browse any past date with available articles:

- **Mobile**: tap a highlighted date on the calendar to open that day's articles. Tap **← Archive** to return to the calendar.
- **Desktop**: the calendar is in the left sidebar. Click a date to load its articles in the main panel. Use the edition tabs to jump between newsletters.

Greyed-out dates have no articles (weekends, gaps in the data, future dates).

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React + Vite, deployed to Azure Static Web Apps |
| API | Azure Functions v3 (Node.js) |
| Database | Azure Cosmos DB (NoSQL) |
| Auth | Microsoft (Azure AD) via Azure SWA built-in auth |
| Article data | Static JSON files served from `public/data/archive/` |
| Ingestion | Node.js + Cheerio scraper (`scripts/jobs/ingestToday.ts`) |

User state (flagged articles, saved articles) is stored per-user in Cosmos DB. Article content is served as static JSON — no database read required for browsing.

---

## Data Ingestion Pipeline

Article content is scraped directly from [tldr.tech](https://tldr.tech) using a deterministic Node.js pipeline — no email, no LLM, no manual steps.

### How it works

1. **Fetch** — Each of the 14 TLDR editions is requested at `https://tldr.tech/{slug}/{date}`. If TLDR redirects to the newsletter root (their signal for "no issue today"), the edition is skipped.
2. **Parse** — Cheerio extracts every `<h3>` + following `<p>` pair. Sponsored and hiring items are filtered out.
3. **Write** — Each edition is written as a JSON file to `public/data/archive/{year}/{date}/`.
4. **Manifests** — The day's `manifest.json` (which tabs React renders) and the year-level `manifest-{year}.json` (which dates the calendar highlights) are both updated.
5. **Publish** — All new files are committed and pushed to `main` in a single git commit. Azure Static Web Apps picks up the push automatically.

### Running manually

```bash
npm run ingest                   # scrape today's date
npm run ingest 2026-06-27        # scrape a specific date
npx tsx scripts/jobs/ingestToday.ts 2026-06-27   # equivalent longform
```

### Module layout

```text
scripts/
  config/
    newsletters.ts         # all 14 editions — slug, display name, filename
  scraper/
    fetchIssue.ts          # fetch HTML for one edition/date
    parseIssue.ts          # Cheerio parser → Article[]
    isSponsored.ts         # filter predicate for sponsored items
  archive/
    writeEdition.ts        # write one edition JSON file
    writeDailyManifest.ts  # write/overwrite manifest.json for a day
    writeYearManifest.ts   # update the rolling year-level index
  jobs/
    ingestToday.ts         # CLI entry point; orchestrates the full pipeline
```

### Automation

The pipeline runs daily at 2:00 PM via a scheduled Claude Cowork agent. On completion it sends a push notification — success with edition count, or the specific failure reason if something went wrong.

---

## Local Development

You need [Azure Functions Core Tools](https://learn.microsoft.com/azure/azure-functions/functions-run-local) installed.

**Terminal 1 — API:**

```bash
cd api
func start
```

**Terminal 2 — Frontend:**

```bash
npm run dev
```

The Vite dev server proxies `/api` requests to the Functions process on `localhost:7071`. The `LOCAL_DEV=true` flag in `api/local.settings.json` bypasses Azure AD auth and uses a fake dev user.

**Build for production:**

```bash
npm run build
```
