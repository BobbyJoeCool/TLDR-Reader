import { useState, useEffect, useCallback } from 'react';
import DayTabs from '../components/DayTabs';
import EditionTabs, { defaultEdition, sortEditions } from '../components/EditionTabs';
import ArticleCard from '../components/ArticleCard';

export default function WeekPage({ label, days, flaggedUrls, onToggleFlag, loading, useSidebar }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEdition, setSelectedEdition] = useState(null);

  // Pick a default day when data arrives
  useEffect(() => {
    if (!days.length) return;
    const sorted = [...days].sort((a, b) => new Date(b.date) - new Date(a.date));
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
    const todayDoc = days.find((d) => d.date === today);
    setSelectedDate((prev) => prev ?? (todayDoc ? today : sorted[0].date));
  }, [days]);

  // Reset edition when day changes
  const currentDay = days.find((d) => d.date === selectedDate);
  const editions = currentDay?.editions ?? [];

  useEffect(() => {
    if (!editions.length) return;
    setSelectedEdition(defaultEdition(editions));
  }, [selectedDate]);

  const handleSelectEdition = useCallback((name) => setSelectedEdition(name), []);

  const currentEdition = editions.find((e) => e.name === selectedEdition);
  const sortedEditions = sortEditions(editions);

  if (loading) {
    return (
      <div className="page week-page">
        <div className="sticky-tabs-area">
          <div className="week-label">{label}</div>
        </div>
        <div className="page-content"><div className="empty-state"><div className="spinner" /></div></div>
      </div>
    );
  }

  if (!days.length) {
    return (
      <div className="page week-page">
        <div className="sticky-tabs-area">
          <div className="week-label">{label}</div>
        </div>
        <div className="page-content">
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
      <div className="sticky-tabs-area">
        <div className="week-label">{label}</div>
        <DayTabs days={days} selectedDay={selectedDate} onSelectDay={setSelectedDate} />
        {!useSidebar && (
          <EditionTabs
            editions={sortedEditions}
            selectedEdition={selectedEdition}
            onSelectEdition={handleSelectEdition}
            layout="row"
          />
        )}
      </div>

      <div className={`week-body ${useSidebar ? 'with-sidebar' : ''}`}>
        {useSidebar && (
          <EditionTabs
            editions={sortedEditions}
            selectedEdition={selectedEdition}
            onSelectEdition={handleSelectEdition}
            layout="sidebar"
          />
        )}

        <div className="week-content">
          {currentEdition ? (
            <>
              <div className="edition-header" data-edition={currentEdition.name}>
                <div className="edition-header-dot" />
                <div>
                  <h2 className="edition-header-name">{currentEdition.name}</h2>
                  <p className="edition-header-count">
                    {currentEdition.articles.length} articles
                  </p>
                </div>
              </div>

              {currentEdition.articles.map((article) => (
                <ArticleCard
                  key={article.url}
                  article={{ ...article, edition: currentEdition.name, date: selectedDate, day: currentDay.day }}
                  isFlagged={flaggedUrls.has(article.url)}
                  onToggleFlag={onToggleFlag}
                />
              ))}
            </>
          ) : (
            <div className="empty-state">
              <p className="empty-title">No articles for this edition</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
