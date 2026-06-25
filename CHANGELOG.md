# Changelog

All notable changes to TLDR Reader are documented here.

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
