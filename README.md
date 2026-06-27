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

User state (flagged articles, saved articles) is stored per-user in Cosmos DB. Article content is served as static JSON — no database read required for browsing.

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
