export default function ArticleCard({ article, isFlagged, onToggleFlag, isSaved, onToggleSave }) {
  return (
    <div className={`article-card ${isFlagged ? 'flagged' : ''}`}>
      <div className="article-card-top">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="article-card-title"
        >
          {article.title}
        </a>
        <div className="article-card-actions">
          <button
            className={`save-btn ${isSaved ? 'saved' : ''}`}
            onClick={() => onToggleSave(article)}
            aria-label={isSaved ? 'Remove from saved articles' : 'Save article'}
            title={isSaved ? 'Remove from saved articles' : 'Save article'}
          >
            <StarIcon filled={isSaved} />
          </button>
          <button
            className={`flag-btn ${isFlagged ? 'flagged' : ''}`}
            onClick={() => onToggleFlag(article)}
            aria-label={isFlagged ? 'Remove from reading list' : 'Add to reading list'}
            title={isFlagged ? 'Remove from reading list' : 'Add to reading list'}
          >
            <FlagIcon filled={isFlagged} />
          </button>
        </div>
      </div>
      {article.summary && (
        <p className="article-card-summary">{article.summary}</p>
      )}
    </div>
  );
}

function StarIcon({ filled }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function FlagIcon({ filled }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}
