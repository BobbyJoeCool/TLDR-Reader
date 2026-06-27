import DayTabs from '../components/DayTabs';
import EditionTabs, { sortEditions } from '../components/EditionTabs';
import ArticleCard from '../components/ArticleCard';

function editionSlug(name) {
  return 'edition-' + name.replace(/\s+/g, '-').toLowerCase();
}

export default function WeekPage({
  label,
  days,
  flaggedUrls,
  onToggleFlag,
  savedUrls,
  onToggleSave,
  loading,
  dayLoading,
  selectedDate,
  setSelectedDate,
  isDesktop,
}) {
  const currentDay = days.find((d) => d.date === selectedDate);
  const editions = sortEditions(currentDay?.editions ?? []);

  const scrollToEdition = (name) => {
    document.getElementById(editionSlug(name))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="page week-page">
        {!isDesktop && (
          <div className="sticky-tabs-area">
            <div className="week-label">{label}</div>
          </div>
        )}
        <div className="week-content-area">
          <div className="empty-state"><div className="spinner" /></div>
        </div>
      </div>
    );
  }

  if (!days.length) {
    return (
      <div className="page week-page">
        {!isDesktop && (
          <div className="sticky-tabs-area">
            <div className="week-label">{label}</div>
          </div>
        )}
        <div className="week-content-area">
          <div className="empty-state">
            <p className="empty-title">No articles yet</p>
            <p className="empty-body">
              {label === 'This Week'
                ? 'Cowork will import articles at 9 AM.'
                : 'No articles from last week.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page week-page">
      {!isDesktop && (
        <div className="sticky-tabs-area">
          <div className="week-label">{label}</div>
          <DayTabs
            days={days}
            selectedDay={selectedDate}
            onSelectDay={setSelectedDate}
            layout="row"
          />
          <EditionTabs
            editions={editions}
            onSelectEdition={scrollToEdition}
            layout="row"
          />
        </div>
      )}

      <div className="week-content-area">
        {editions.length === 0 ? (
          <div className="empty-state">
            {dayLoading
              ? <div className="spinner" />
              : <p className="empty-title">No articles for this day</p>
            }
          </div>
        ) : (
          editions.map((edition) => (
            <div
              key={edition.name}
              id={editionSlug(edition.name)}
              className="edition-section"
              data-edition={edition.name}
            >
              <div className="edition-header">
                <div className="edition-header-dot" />
                <div>
                  <h2 className="edition-header-name">{edition.name}</h2>
                  <p className="edition-header-count">{edition.articles.length} articles</p>
                </div>
              </div>
              {edition.articles.map((article) => (
                <ArticleCard
                  key={article.url}
                  article={{
                    ...article,
                    edition: edition.name,
                    date: selectedDate,
                    day: currentDay.day,
                  }}
                  isFlagged={flaggedUrls.has(article.url)}
                  onToggleFlag={onToggleFlag}
                  isSaved={savedUrls?.has(article.url)}
                  onToggleSave={onToggleSave}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
