# Changelog

All notable changes to TLDR Reader are documented here.

## [2.2.0] — Planned

### Planned

- **Filter by edition** on the Saved Articles page — narrow the list to a specific newsletter.
- **Filter by date range** on the Saved Articles page — show only articles saved within a given window.
- **Keyword search** across Saved Articles — full-text search on title and summary.

> These features were deferred from the initial Saved Articles implementation (see refactorInstructions.md §4–5). No implementation timeline set.

---

## [2.1.0] — 2026-06-27

### Changed

- **Ingestion pipeline refactor**: Replaced the monolithic `scripts/scrape-tldr.ts` with a proper multi-module architecture under `scripts/`. The single file is now split into eight focused modules — `config/newsletters.ts`, `scraper/isSponsored.ts`, `scraper/fetchIssue.ts`, `scraper/parseIssue.ts`, `archive/writeEdition.ts`, `archive/writeDailyManifest.ts`, `archive/writeYearManifest.ts`, and `jobs/ingestToday.ts`. Behavior is identical; structure is now testable and extensible.
- **Redirect detection**: `fetchIssue` now detects TLDR's no-issue redirect signal (response URL no longer contains the requested date) and returns `null` immediately, matching the documented spec behavior.
- **Cowork prompt**: `DevNotes/CoworkPrompt.txt` replaced the old 480-line Gmail/LLM pipeline with a 7-line script trigger. Added error-handling guidance covering all three failure modes and push notification instructions for success, no-editions, git failure, and script crash outcomes.

### Added

- **`npm run ingest`**: Shorthand script in `package.json` for running the ingestion pipeline — equivalent to `npx tsx scripts/jobs/ingestToday.ts`.
- **Full script documentation**: Every module has a file-level JSDoc header, `@param`/`@returns` docs on all exported functions, and inline comments explaining all non-obvious logic — regex patterns, timezone anchoring, week-offset arithmetic, and git scoping.
- **Push notifications on cowork runs**: The scheduled cowork agent now sends a push notification on every outcome — success with edition count, expected no-edition days, git failures, and script crashes — so results are visible without checking the session transcript.

---

## [2.0.0] — 2026-06-27

### Added

- **Landing page**: The app now opens on a hub screen with a personalized greeting, large navigation tiles for all five sections, and a quick guide explaining how to flag, read, and save articles.
- **Home button (mobile)**: A home icon button sits beside the logout button on every screen, returning the user to the landing page from anywhere.
- **Desktop home navigation**: The "TLDR Reader" brand name in the desktop top bar is now a clickable home button.
- **Mobile brand bar**: A persistent "TLDR Reader" bar appears at the top of every non-landing page on mobile, serving as a secondary home button.

---

## [1.4.0] — 2026-06-26

### Added

- **Saved Articles**: Star any article in This Week, Last Week, Archive, or the Reading List to save it permanently. Saved articles persist to Azure Cosmos DB in a dedicated `savedArticles` container.
- **Saved Articles page**: New page (bottom nav on mobile, top nav on desktop) displays all saved articles grouped by newsletter edition in canonical TLDR order, with articles within each edition sorted newest-to-oldest.
- **Star button on article cards**: All article cards (week views, archive, reading list) now show a star icon that toggles save state. Filled star = saved; optimistic update with rollback on failure.
- **Azure Function — `api/savedarticles`**: New serverless endpoint handles GET (fetch saved list by user), POST action=`save` (add article), and POST action=`unsave` (remove by URL). Stored as a `saved` array on the existing `userState` document — no additional Cosmos DB container required.

### Changed

- **Reading List flag icon**: The bookmark icon on the Reading List nav item and article cards has been replaced with a flag icon to better represent "flagged for reading."
- **Nav label**: "Reading List" renamed to "Reading" on the mobile bottom nav to fit the wider 5-item layout.
- **5-item bottom nav**: Mobile navigation now has five items — Reading, This Week, Last Week, Archive, Saved.

---

## [1.2.0] — 2026-06-26

### Added

- **Archive browse**: New Archive tab (bottom nav on mobile, top nav on desktop) lets users pick any past date from a month-grid calendar and read that day's articles in the same format as This Week / Last Week.
- **Calendar with availability greying**: Dates with no articles — all weekends, dates before content begins, and future dates — are visually greyed out and non-interactive. Available dates are derived directly from the year manifest so no hardcoding is needed.
- **Month navigation**: Prev/next arrows let users step through months. The prev arrow disables at the earliest month that has any data; the next arrow disables at the current month.
- **Mobile drill-down**: On mobile, tapping an available date replaces the calendar with the day's article view. A back button returns to the calendar.
- **Desktop split view**: On desktop, the calendar lives in the left sidebar. Selecting a date loads its articles into the main content area without leaving the page.

### Changed

- **Archive-based data model**: Article data is now served from `public/data/archive/YYYY/YYYY-MM-DD/` instead of flat weekly JSON files. Each day has a `manifest.json` listing editions, plus one JSON file per edition containing only `url`, `title`, and `summary` per article.
- **Year manifest** (`public/data/archive/manifest-2026.json`): Single index file listing all weeks newest-to-oldest. React reads only this file on startup; all other data is lazy-loaded on demand when a day is selected.
- **Lazy loading**: The app no longer preloads all week data upfront. Day content is fetched the first time a date is selected, then cached for the session.

---

## [1.1.0] — 2026-06-25

### Fixed

- **Persistence bug**: Flagged articles were lost on every page refresh. Root cause was a Cosmos DB SDK v4 behavior change where `item(id, partitionKey).read()` silently returns `undefined` instead of throwing a 404 when the partition key doesn't match — replaced with a SQL query that works regardless of container partition key setup.
- **Silent API failures**: All API errors in `useUserState` were swallowed silently, making it impossible to distinguish a working empty list from a broken one. Errors now log to the console and surface a message to the user.
- **No optimistic rollback**: Flagging and read-state changes updated the UI immediately but never rolled back if the API call failed — state would appear saved in-session then vanish on reload. All three mutations (`flag`, `unflag`, `read`) now roll back on failure.
- **Local dev auth**: The `x-ms-client-principal` header injected by Azure SWA is absent when running locally, causing every API call to return 401. Added a `LOCAL_DEV` env var fallback in `getUser()` that returns a fake dev user.
- **Local dev proxy**: Added Vite dev server proxy so `/api` and `/.auth` requests are forwarded to the Azure Functions process (`localhost:7071`) during local development.

---

## [1.0.0] — 2026-06-23

### Initial release

- Microsoft (Azure AD) authentication via Azure Static Web Apps built-in auth
- Three-screen layout: Reading List, This Week, Last Week
- Flag articles to save them to your reading list
- Mark articles as read/unread
- Reading list persisted to Azure Cosmos DB per user
- Edition tabs (TLDR, TLDR AI, TLDR Dev, etc.) with color coding
- Day tabs with per-day color coding (Mon–Fri)
- Responsive layout: mobile bottom nav + sticky tabs; desktop/tablet sidebar
- Article data served as static JSON from the repo — no database needed for content
