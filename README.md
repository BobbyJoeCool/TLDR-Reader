# TLDR Reader

A mobile-friendly web app for reading and saving TLDR newsletter articles.
Replaces the Obsidian-based workflow — no vault indexing, works great on mobile.

## Features

- **Issue pages** — Browse each day's TLDR, grouped by section
- **Save articles** — Tap ★ on any article to add it to your reading list
- **Saved drawer** — Persistent reading list accessible from the home screen
- **Auto-purge** — Issues older than 10 days are cleared every Monday
- **Import** — Paste JSON or upload a file to add each day's issue

## Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/tldr-reader.git
cd tldr-reader
npm install
```

### 2. Update the repo name in vite.config.js

```js
base: "/tldr-reader/",  // change to match your GitHub repo name
```

### 3. Enable GitHub Pages

In your repo settings:
- Go to **Settings → Pages**
- Set **Source** to **GitHub Actions**

### 4. Push to main

The GitHub Actions workflow will build and deploy automatically.

```bash
git add .
git commit -m "Initial deploy"
git push origin main
```

Your app will be live at:
`https://YOUR_USERNAME.github.io/tldr-reader/`

## Local development

```bash
npm run dev
```

## Adding a new issue (CoWork)

CoWork outputs a `.json` file (see `COWORK_FORMAT.md` for the schema).
In the app, tap **+ Import Issue** and either:
- Upload the `.json` file, or
- Paste the JSON directly

## Data storage

Everything is stored in your browser's `localStorage` — no server, no account needed.
Saved articles persist across sessions.
