import { useState, useEffect } from 'react';
import './App.css';
import { useAuth } from './hooks/useAuth';
import { useArchive } from './hooks/useArchive';
import { useUserState } from './hooks/useUserState';
import { useSavedArticles } from './hooks/useSavedArticles';
import { useMediaQuery } from './hooks/useMediaQuery';
import AuthGate from './components/AuthGate';
import BottomNav from './components/BottomNav';
import DayTabs from './components/DayTabs';
import EditionTabs, { sortEditions } from './components/EditionTabs';
import HomePage from './pages/HomePage';
import WeekPage from './pages/WeekPage';
import ArchivePage from './pages/ArchivePage';
import SavedArticlesPage from './pages/SavedArticlesPage';
import LandingPage from './pages/LandingPage';

export default function App() {
  const [page, setPage] = useState('landing');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEdition, setSelectedEdition] = useState(null);

  const isDesktop = useMediaQuery(
    '(min-width: 768px) and (orientation: landscape), (min-width: 1024px)'
  );

  const { user, login, logout } = useAuth();
  const { loading, thisWeekDays, lastWeekDays, availableDates, loadDay, getDay, isDayLoading } = useArchive();
  const { flagged, flaggedUrls, loading: usLoading, error: usError, toggleFlag, toggleRead } = useUserState(user);
  const { saved, savedUrls, loading: savedLoading, error: savedError, toggleSave } = useSavedArticles(user);

  const currentDays = page === 'thisWeek' ? thisWeekDays : page === 'lastWeek' ? lastWeekDays : [];
  const weekLoading = loading;

  // Auto-select the most relevant date when page or data changes
  useEffect(() => {
    if (!currentDays.length) { setSelectedDate(null); setSelectedEdition(null); return; }
    const today = new Date().toLocaleDateString('en-CA');
    setSelectedDate((prev) => {
      if (prev && currentDays.find((d) => d.date === prev)) return prev;
      return (
        currentDays.find((d) => d.date === today)?.date ??
        [...currentDays].sort((a, b) => new Date(b.date) - new Date(a.date))[0].date
      );
    });
    setSelectedEdition(null);
  }, [page, thisWeekDays, lastWeekDays]);

  useEffect(() => {
    if (selectedDate && (page === 'thisWeek' || page === 'lastWeek')) {
      loadDay(selectedDate);
    }
  }, [selectedDate, page, loadDay]);

  const currentDay = currentDays.find((d) => d.date === selectedDate);
  const currentEditions = sortEditions(currentDay?.editions ?? []);

  const scrollToEdition = (name) => {
    const id = 'edition-' + name.replace(/\s+/g, '-').toLowerCase();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setSelectedEdition(name);
  };

  const handleDaySelect = (date) => {
    setSelectedDate(date);
    setSelectedEdition(null);
  };

  const handleUnflag = (url) => toggleFlag({ url });

  if (user === undefined || user === null) {
    return <AuthGate user={user} login={login} />;
  }

  const weekLabel = page === 'thisWeek' ? 'This Week' : 'Last Week';
  const isWeekPage = page === 'thisWeek' || page === 'lastWeek';

  if (isDesktop) {
    return (
      <div className="app app--desktop">
        <header className="top-bar">
          <button className="top-bar-brand" onClick={() => setPage('landing')}>TLDR Reader</button>
          <nav className="top-bar-nav">
            <button
              className={`top-nav-btn ${page === 'home' ? 'active' : ''}`}
              onClick={() => setPage('home')}
            >
              <FlagNavIcon /> Reading List
            </button>
            <button
              className={`top-nav-btn ${page === 'thisWeek' ? 'active' : ''}`}
              onClick={() => setPage('thisWeek')}
            >
              <CalendarIcon /> This Week
            </button>
            <button
              className={`top-nav-btn ${page === 'lastWeek' ? 'active' : ''}`}
              onClick={() => setPage('lastWeek')}
            >
              <HistoryIcon /> Last Week
            </button>
            <button
              className={`top-nav-btn ${page === 'archive' ? 'active' : ''}`}
              onClick={() => setPage('archive')}
            >
              <ArchiveIcon /> Archive
            </button>
            <button
              className={`top-nav-btn ${page === 'saved' ? 'active' : ''}`}
              onClick={() => setPage('saved')}
            >
              <StarNavIcon /> Saved Articles
            </button>
          </nav>
          <button className="logout-btn" onClick={logout} title="Sign out">
            <LogoutIcon />
          </button>
        </header>

        {page === 'landing' ? (
          <div className="app-body">
            <main className="app-content">
              <LandingPage
                user={user}
                onNavigate={setPage}
                flaggedCount={flagged.length}
                savedCount={saved.length}
              />
            </main>
          </div>
        ) : page === 'archive' ? (
          <ArchivePage
            availableDates={availableDates}
            getDay={getDay}
            loadDay={loadDay}
            isDayLoading={isDayLoading}
            flaggedUrls={flaggedUrls}
            onToggleFlag={toggleFlag}
            savedUrls={savedUrls}
            onToggleSave={toggleSave}
            isDesktop
          />
        ) : (
          <div className="app-body">
            {isWeekPage && (
              <aside className="app-sidebar">
                {currentDays.length > 0 && selectedDate && (
                  <DayTabs
                    days={currentDays}
                    selectedDay={selectedDate}
                    onSelectDay={handleDaySelect}
                    layout="sidebar"
                  />
                )}
                {currentEditions.length > 0 && (
                  <EditionTabs
                    editions={currentEditions}
                    selectedEdition={selectedEdition}
                    onSelectEdition={scrollToEdition}
                    layout="sidebar"
                  />
                )}
              </aside>
            )}

            <main className="app-content">
              {page === 'home' && (
                <HomePage
                  flagged={flagged}
                  onToggleRead={toggleRead}
                  onUnflag={handleUnflag}
                  savedUrls={savedUrls}
                  onToggleSave={toggleSave}
                  loading={usLoading}
                  error={usError}
                />
              )}
              {isWeekPage && (
                <WeekPage
                  key={page}
                  label={weekLabel}
                  days={currentDays}
                  flaggedUrls={flaggedUrls}
                  onToggleFlag={toggleFlag}
                  savedUrls={savedUrls}
                  onToggleSave={toggleSave}
                  loading={weekLoading}
                  dayLoading={isDayLoading(selectedDate)}
                  selectedDate={selectedDate}
                  setSelectedDate={handleDaySelect}
                  isDesktop
                />
              )}
              {page === 'saved' && (
                <SavedArticlesPage
                  saved={saved}
                  onToggleSave={toggleSave}
                  loading={savedLoading}
                  error={savedError}
                />
              )}
            </main>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app">
      {page !== 'landing' && (
        <div className="mobile-brand-bar">
          <button className="mobile-brand-btn" onClick={() => setPage('landing')}>
            TLDR Reader
          </button>
        </div>
      )}
      <div className="page-container">
        {page === 'landing' && (
          <LandingPage
            user={user}
            onNavigate={setPage}
            flaggedCount={flagged.length}
            savedCount={saved.length}
          />
        )}
        {page === 'home' && (
          <HomePage
            flagged={flagged}
            onToggleRead={toggleRead}
            onUnflag={handleUnflag}
            savedUrls={savedUrls}
            onToggleSave={toggleSave}
            loading={usLoading}
          />
        )}
        {isWeekPage && (
          <WeekPage
            key={page}
            label={weekLabel}
            days={currentDays}
            flaggedUrls={flaggedUrls}
            onToggleFlag={toggleFlag}
            savedUrls={savedUrls}
            onToggleSave={toggleSave}
            loading={weekLoading}
            dayLoading={isDayLoading(selectedDate)}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        )}
        {page === 'archive' && (
          <ArchivePage
            availableDates={availableDates}
            getDay={getDay}
            loadDay={loadDay}
            isDayLoading={isDayLoading}
            flaggedUrls={flaggedUrls}
            onToggleFlag={toggleFlag}
            savedUrls={savedUrls}
            onToggleSave={toggleSave}
          />
        )}
        {page === 'saved' && (
          <SavedArticlesPage
            saved={saved}
            onToggleSave={toggleSave}
            loading={savedLoading}
            error={savedError}
          />
        )}
      </div>

      <BottomNav page={page} onNavigate={setPage} />

      {page !== 'landing' && (
        <button className="home-btn" onClick={() => setPage('landing')} title="Home">
          <HomeIcon />
        </button>
      )}

      <button className="logout-btn" onClick={logout} title="Sign out">
        <LogoutIcon />
      </button>
    </div>
  );
}

function FlagNavIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

function StarNavIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
