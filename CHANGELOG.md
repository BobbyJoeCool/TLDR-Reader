# Changelog

All notable changes to TLDR Reader are documented here.

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
