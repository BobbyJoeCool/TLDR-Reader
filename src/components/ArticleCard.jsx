export default function ArticleCard({ article, isFlagged, onToggleFlag }) {
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
        <button
          className={`flag-btn ${isFlagged ? 'flagged' : ''}`}
          onClick={() => onToggleFlag(article)}
          aria-label={isFlagged ? 'Remove from reading list' : 'Save to reading list'}
          title={isFlagged ? 'Remove from reading list' : 'Save to reading list'}
        >
          <StarIcon filled={isFlagged} />
        </button>
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
