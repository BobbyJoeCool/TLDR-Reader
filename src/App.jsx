import { useState, useEffect, useCallback } from "react";
import "./App.css";

const STORAGE_KEYS = {
  ISSUES: "tldr_issues",
  SAVED: "tldr_saved",
};

const DAYS_TO_KEEP = 10;

function purgeOldIssues(issues) {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - DAYS_TO_KEEP);
  return issues.filter((issue) => new Date(issue.date) >= cutoff);
}

function shouldPurgeToday() {
  const today = new Date();
  return today.getDay() === 1; // Monday
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function SavedIcon({ filled }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "#F59E0B" : "none"}
      stroke={filled ? "#F59E0B" : "#6B7280"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ArticleCard({ article, isSaved, onToggleSave, issueLabel }) {
  return (
    <div className={`article-card ${isSaved ? "saved" : ""}`}>
      <div className="article-header">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="article-title"
        >
          {article.title}
        </a>
        <button
          className="save-btn"
          onClick={() => onToggleSave(article)}
          aria-label={isSaved ? "Remove from saved" : "Save article"}
          title={isSaved ? "Remove from saved" : "Save article"}
        >
          <SavedIcon filled={isSaved} />
        </button>
      </div>
      {article.summary && (
        <p className="article-summary">{article.summary}</p>
      )}
      {issueLabel && (
        <span className="issue-label">{issueLabel}</span>
      )}
    </div>
  );
}

function IssueView({ issue, savedIds, onToggleSave, onBack }) {
  return (
    <div className="issue-view">
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>
      <h1 className="issue-title">{formatDate(issue.date)}</h1>
      <p className="issue-subtitle">TLDR Newsletter</p>

      {issue.sections.map((section) => (
        <div key={section.name} className="section">
          <h2 className="section-name">{section.name}</h2>
          {section.articles.map((article) => (
            <ArticleCard
              key={article.url}
              article={article}
              isSaved={savedIds.has(article.url)}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function HomeView({ issues, savedArticles, savedIds, onToggleSave, onOpenIssue, onImport }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [showImport, setShowImport] = useState(false);

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      tryImport(ev.target.result);
    };
    reader.readAsText(file);
  };

  const tryImport = (text) => {
    try {
      const data = JSON.parse(text);
      if (!data.date || !data.sections) throw new Error("Invalid format");
      onImport(data);
      setImportText("");
      setImportError("");
      setShowImport(false);
    } catch {
      setImportError("Invalid JSON. Make sure it matches the TLDR issue format.");
    }
  };

  const handlePasteImport = () => {
    tryImport(importText);
  };

  const sortedIssues = [...issues].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="home-view">
      <header className="app-header">
        <div className="header-inner">
          <div>
            <h1 className="app-title">TLDR</h1>
            <p className="app-tagline">Your daily reading queue</p>
          </div>
          <div className="header-actions">
            <button
              className="import-toggle-btn"
              onClick={() => setShowImport((v) => !v)}
            >
              + Import Issue
            </button>
            <button
              className="saved-toggle-btn"
              onClick={() => setDrawerOpen((v) => !v)}
            >
              <SavedIcon filled={true} />
              <span>{savedArticles.length}</span>
            </button>
          </div>
        </div>
      </header>

      {showImport && (
        <div className="import-panel">
          <h3 className="import-title">Import a TLDR Issue</h3>
          <label className="file-label">
            <span>Choose JSON file</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="file-input"
            />
          </label>
          <p className="import-or">— or paste JSON —</p>
          <textarea
            className="import-textarea"
            placeholder='{ "date": "2026-06-19", "label": "Friday June 19", "sections": [...] }'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={5}
          />
          {importError && <p className="import-error">{importError}</p>}
          <button className="import-btn" onClick={handlePasteImport}>
            Import
          </button>
        </div>
      )}

      <main className="main-content">
        <section className="issues-section">
          <h2 className="section-heading">Recent Issues</h2>
          {sortedIssues.length === 0 ? (
            <div className="empty-state">
              <p>No issues yet.</p>
              <p>Import your first TLDR issue using the button above.</p>
            </div>
          ) : (
            <div className="issue-list">
              {sortedIssues.map((issue) => {
                const totalArticles = issue.sections.reduce(
                  (n, s) => n + s.articles.length,
                  0
                );
                const savedCount = issue.sections.reduce(
                  (n, s) =>
                    n + s.articles.filter((a) => savedIds.has(a.url)).length,
                  0
                );
                return (
                  <button
                    key={issue.date}
                    className="issue-card"
                    onClick={() => onOpenIssue(issue)}
                  >
                    <div className="issue-card-header">
                      <span className="issue-card-date">
                        {formatDate(issue.date)}
                      </span>
                      {savedCount > 0 && (
                        <span className="issue-saved-badge">
                          ★ {savedCount} saved
                        </span>
                      )}
                    </div>
                    <span className="issue-card-meta">
                      {issue.sections.length} sections · {totalArticles} articles
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Saved Drawer */}
      <div className={`saved-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="drawer-handle-bar" onClick={() => setDrawerOpen(false)} />
        <div className="drawer-header">
          <h2 className="drawer-title">Saved Articles</h2>
          <button
            className="drawer-close"
            onClick={() => setDrawerOpen(false)}
          >
            ✕
          </button>
        </div>
        <div className="drawer-content">
          {savedArticles.length === 0 ? (
            <p className="drawer-empty">
              Tap ★ on any article to save it here.
            </p>
          ) : (
            savedArticles.map((article) => (
              <ArticleCard
                key={article.url}
                article={article}
                isSaved={true}
                onToggleSave={onToggleSave}
                issueLabel={article._issueLabel}
              />
            ))
          )}
        </div>
      </div>
      {drawerOpen && (
        <div
          className="drawer-overlay"
          onClick={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  const [issues, setIssues] = useState([]);
  const [savedMap, setSavedMap] = useState({}); // url -> article+meta
  const [currentIssue, setCurrentIssue] = useState(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const rawIssues = localStorage.getItem(STORAGE_KEYS.ISSUES);
      let loadedIssues = rawIssues ? JSON.parse(rawIssues) : [];
      if (shouldPurgeToday()) {
        loadedIssues = purgeOldIssues(loadedIssues);
        localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(loadedIssues));
      }
      setIssues(loadedIssues);
    } catch {
      setIssues([]);
    }

    try {
      const rawSaved = localStorage.getItem(STORAGE_KEYS.SAVED);
      setSavedMap(rawSaved ? JSON.parse(rawSaved) : {});
    } catch {
      setSavedMap({});
    }
  }, []);

  const persistIssues = (updated) => {
    setIssues(updated);
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(updated));
  };

  const persistSaved = (updated) => {
    setSavedMap(updated);
    localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(updated));
  };

  const handleImport = useCallback(
    (issueData) => {
      const exists = issues.find((i) => i.date === issueData.date);
      if (exists) {
        // Replace existing
        persistIssues(
          issues.map((i) => (i.date === issueData.date ? issueData : i))
        );
      } else {
        persistIssues([...issues, issueData]);
      }
    },
    [issues]
  );

  const handleToggleSave = useCallback(
    (article, issue) => {
      const url = article.url;
      const updated = { ...savedMap };
      if (updated[url]) {
        delete updated[url];
      } else {
        const issueLabel =
          issue?.label ||
          currentIssue?.label ||
          (currentIssue ? formatDate(currentIssue.date) : "");
        updated[url] = { ...article, _issueLabel: issueLabel };
      }
      persistSaved(updated);
    },
    [savedMap, currentIssue]
  );

  const savedIds = new Set(Object.keys(savedMap));
  const savedArticles = Object.values(savedMap);

  return (
    <>
      {currentIssue ? (
        <IssueView
          issue={currentIssue}
          savedIds={savedIds}
          onToggleSave={(article) => handleToggleSave(article, currentIssue)}
          onBack={() => setCurrentIssue(null)}
        />
      ) : (
        <HomeView
          issues={issues}
          savedArticles={savedArticles}
          savedIds={savedIds}
          onToggleSave={handleToggleSave}
          onOpenIssue={setCurrentIssue}
          onImport={handleImport}
        />
      )}
    </>
  );
}
