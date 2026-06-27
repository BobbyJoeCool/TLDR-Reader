const EDITION_ORDER = [
  'TLDR', 'TLDR AI', 'TLDR Dev', 'TLDR DevOps', 'TLDR Product', 'TLDR IT',
  'TLDR InfoSec', 'TLDR Founders', 'TLDR Design', 'TLDR Marketing',
  'TLDR Crypto', 'TLDR Fintech', 'TLDR Data', 'TLDR Hardware',
];

function groupByEdition(articles) {
  const map = {};
  for (const article of articles) {
    const key = article.edition || 'Unknown';
    if (!map[key]) map[key] = [];
    map[key].push(article);
  }
  for (const key of Object.keys(map)) {
    map[key].sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  return Object.entries(map).sort(([a], [b]) => {
    const ai = EDITION_ORDER.indexOf(a);
    const bi = EDITION_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SavedArticlesPage({ saved, onToggleSave, loading, error }) {
  const groups = groupByEdition(saved);

  return (
    <div className="page home-page">
      <header className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">TLDR</h1>
            <p className="page-subtitle">Saved Articles</p>
          </div>
          {saved.length > 0 && (
            <span className="unread-badge">{saved.length} saved</span>
          )}
        </div>
      </header>

      <main className="page-content">
        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="empty-state"><div className="spinner" /></div>
        ) : saved.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">★</p>
            <p className="empty-title">No saved articles yet</p>
            <p className="empty-body">
              Star articles in any view to save them here permanently.
            </p>
          </div>
        ) : (
          groups.map(([edition, articles]) => (
            <section key={edition} className="home-section">
              <h2 className="home-section-heading">{edition}</h2>
              {articles.map((article) => (
                <div key={article.url} className="saved-card">
                  <div className="saved-card-body">
                    <div className="saved-card-content">
                      <span className="saved-card-date">{formatDate(article.date)}</span>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flagged-card-title"
                      >
                        {article.title}
                      </a>
                      {article.summary && (
                        <p className="flagged-card-summary">{article.summary}</p>
                      )}
                    </div>
                    <button
                      className="save-btn saved"
                      onClick={() => onToggleSave(article)}
                      aria-label="Remove from saved articles"
                      title="Remove from saved articles"
                    >
                      <StarIcon />
                    </button>
                  </div>
                </div>
              ))}
            </section>
          ))
        )}
      </main>
    </div>
  );
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
