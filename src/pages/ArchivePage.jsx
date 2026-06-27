import { useState } from 'react';
import ArchiveCalendar from '../components/ArchiveCalendar';
import EditionTabs, { sortEditions } from '../components/EditionTabs';
import ArticleCard from '../components/ArticleCard';

function editionSlug(name) {
  return 'edition-' + name.replace(/\s+/g, '-').toLowerCase();
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

export default function ArchivePage({
  availableDates,
  getDay,
  loadDay,
  isDayLoading,
  flaggedUrls,
  onToggleFlag,
  savedUrls,
  onToggleSave,
  isDesktop,
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEdition, setSelectedEdition] = useState(null);

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setSelectedEdition(null);
    loadDay(date);
  };

  const editions = sortEditions(selectedDate ? getDay(selectedDate) : []);
  const dayLoading = selectedDate ? isDayLoading(selectedDate) : false;

  const scrollToEdition = (name) => {
    document.getElementById(editionSlug(name))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setSelectedEdition(name);
  };

  if (isDesktop) {
    return (
      <div className="app-body">
        <aside className="app-sidebar archive-sidebar">
          <div className="sidebar-section-label">Archive</div>
          <ArchiveCalendar
            availableDates={availableDates}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
          {editions.length > 0 && (
            <EditionTabs
              editions={editions}
              selectedEdition={selectedEdition}
              onSelectEdition={scrollToEdition}
              layout="sidebar"
            />
          )}
        </aside>
        <main className="app-content">
          {!selectedDate ? (
            <div className="empty-state" style={{ paddingTop: '80px' }}>
              <p className="empty-title">Select a date</p>
              <p className="empty-body">Choose a highlighted date from the calendar to view articles.</p>
            </div>
          ) : (
            <div className="week-content-area">
              <DayContent
                selectedDate={selectedDate}
                editions={editions}
                dayLoading={dayLoading}
                flaggedUrls={flaggedUrls}
                onToggleFlag={onToggleFlag}
                savedUrls={savedUrls}
                onToggleSave={onToggleSave}
              />
            </div>
          )}
        </main>
      </div>
    );
  }

  // Mobile: calendar view
  if (!selectedDate) {
    return (
      <div className="page archive-page">
        <div className="sticky-tabs-area">
          <div className="week-label">Archive</div>
        </div>
        <div className="archive-calendar-wrap">
          <ArchiveCalendar
            availableDates={availableDates}
            selectedDate={null}
            onSelectDate={handleSelectDate}
          />
        </div>
      </div>
    );
  }

  // Mobile: day articles view
  return (
    <div className="page archive-page">
      <div className="sticky-tabs-area">
        <div className="archive-day-nav">
          <button className="archive-back-btn" onClick={() => setSelectedDate(null)}>
            <BackIcon />
            Archive
          </button>
          <div className="archive-day-label">{formatDate(selectedDate)}</div>
        </div>
        {editions.length > 0 && (
          <EditionTabs
            editions={editions}
            selectedEdition={selectedEdition}
            onSelectEdition={scrollToEdition}
            layout="row"
          />
        )}
      </div>
      <div className="week-content-area">
        <DayContent
          selectedDate={selectedDate}
          editions={editions}
          dayLoading={dayLoading}
          flaggedUrls={flaggedUrls}
          onToggleFlag={onToggleFlag}
          savedUrls={savedUrls}
          onToggleSave={onToggleSave}
        />
      </div>
    </div>
  );
}

function DayContent({ selectedDate, editions, dayLoading, flaggedUrls, onToggleFlag, savedUrls, onToggleSave }) {
  if (dayLoading) {
    return <div className="empty-state"><div className="spinner" /></div>;
  }
  if (editions.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-title">No articles for this day</p>
      </div>
    );
  }
  return editions.map((edition) => (
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
          article={{ ...article, edition: edition.name, date: selectedDate }}
          isFlagged={flaggedUrls.has(article.url)}
          onToggleFlag={onToggleFlag}
          isSaved={savedUrls?.has(article.url)}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  ));
}

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
