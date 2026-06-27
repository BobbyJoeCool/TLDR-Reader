import FlaggedArticleCard from '../components/FlaggedArticleCard';

export default function HomePage({ flagged, onToggleRead, onUnflag, savedUrls, onToggleSave, loading, error }) {
  const unread = flagged.filter((a) => !a.isRead);
  const read = flagged.filter((a) => a.isRead);

  return (
    <div className="page home-page">
      <header className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">TLDR</h1>
            <p className="page-subtitle">Reading List</p>
          </div>
          <span className="unread-badge">{unread.length} to read</span>
        </div>
      </header>

      <main className="page-content">
        {error && (
          <div className="error-banner">{error}</div>
        )}
        {loading ? (
          <div className="empty-state">
            <div className="spinner" />
          </div>
        ) : flagged.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">★</p>
            <p className="empty-title">Nothing saved yet</p>
            <p className="empty-body">
              Flag articles in This Week, Last Week, or Archive to add them here.
            </p>
          </div>
        ) : (
          <>
            {unread.length > 0 && (
              <section className="home-section">
                <h2 className="home-section-heading">To Read</h2>
                {unread.map((article) => (
                  <FlaggedArticleCard
                    key={article.url}
                    article={article}
                    onToggleRead={onToggleRead}
                    onUnflag={onUnflag}
                    isSaved={savedUrls?.has(article.url)}
                    onToggleSave={onToggleSave}
                  />
                ))}
              </section>
            )}

            {read.length > 0 && (
              <section className="home-section">
                <h2 className="home-section-heading">Read</h2>
                {read.map((article) => (
                  <FlaggedArticleCard
                    key={article.url}
                    article={article}
                    onToggleRead={onToggleRead}
                    onUnflag={onUnflag}
                    isSaved={savedUrls?.has(article.url)}
                    onToggleSave={onToggleSave}
                  />
                ))}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
