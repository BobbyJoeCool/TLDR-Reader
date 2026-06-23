export default function FlaggedArticleCard({ article, onToggleRead, onUnflag }) {
  const { title, url, summary, edition, date, day, isRead } = article;

  return (
    <div className={`flagged-card ${isRead ? 'read' : ''}`}>
      <div className="flagged-card-meta">
        <span className="flagged-card-edition" data-edition={edition}>{edition}</span>
        <span className="flagged-card-date">{day}, {formatDate(date)}</span>
      </div>
      <div className="flagged-card-body">
        <div className="flagged-card-content">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flagged-card-title"
          >
            {title}
          </a>
          {summary && (
            <p className="flagged-card-summary">{summary}</p>
          )}
        </div>
        <div className="flagged-card-actions">
          <button
            className={`read-btn ${isRead ? 'active' : ''}`}
            onClick={() => onToggleRead(url)}
            aria-label={isRead ? 'Mark as unread' : 'Mark as read'}
            title={isRead ? 'Mark as unread' : 'Mark as read'}
          >
            <CheckIcon />
          </button>
          <button
            className="unflag-btn"
            onClick={() => onUnflag(url)}
            aria-label="Remove from reading list"
            title="Remove from reading list"
          >
            <XIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
