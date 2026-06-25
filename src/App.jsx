import { useState, useEffect } from 'react';
import './App.css';
import { useAuth } from './hooks/useAuth';
import { useArticles } from './hooks/useArticles';
import { useUserState } from './hooks/useUserState';
import { useMediaQuery } from './hooks/useMediaQuery';
import AuthGate from './components/AuthGate';
import BottomNav from './components/BottomNav';
import DayTabs from './components/DayTabs';
import EditionTabs, { sortEditions } from './components/EditionTabs';
import HomePage from './pages/HomePage';
import WeekPage from './pages/WeekPage';

export default function App() {
  const [page, setPage] = useState('home');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEdition, setSelectedEdition] = useState(null);

  const isDesktop = useMediaQuery(
    '(min-width: 768px) and (orientation: landscape), (min-width: 1024px)'
  );

  const { user, login, logout } = useAuth();
  const { days: thisWeekDays, loading: twLoading } = useArticles('thisWeek');
  const { days: lastWeekDays, loading: lwLoading } = useArticles('lastWeek');
  const { flagged, flaggedUrls, loading: usLoading, error: usError, toggleFlag, toggleRead } = useUserState(user);

  const currentDays = page === 'thisWeek' ? thisWeekDays : page === 'lastWeek' ? lastWeekDays : [];
  const weekLoading = page === 'thisWeek' ? twLoading : lwLoading;

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

  if (isDesktop) {
    return (
      <div className="app app--desktop">
        <header className="top-bar">
          <span className="top-bar-brand">TLDR Reader</span>
          <nav className="top-bar-nav">
            <button
              className={`top-nav-btn ${page === 'home' ? 'active' : ''}`}
              onClick={() => setPage('home')}
            >
              <BookmarkIcon /> Reading List
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
          </nav>
          <button className="logout-btn" onClick={logout} title="Sign out">
            <LogoutIcon />
          </button>
        </header>

        <div className="app-body">
          {page !== 'home' && (
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
                loading={usLoading}
                error={usError}
              />
            )}
            {page !== 'home' && (
              <WeekPage
                key={page}
                label={weekLabel}
                days={currentDays}
                flaggedUrls={flaggedUrls}
                onToggleFlag={toggleFlag}
                loading={weekLoading}
                selectedDate={selectedDate}
                setSelectedDate={handleDaySelect}
                isDesktop
              />
            )}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="page-container">
        {page === 'home' && (
          <HomePage
            flagged={flagged}
            onToggleRead={toggleRead}
            onUnflag={handleUnflag}
            loading={usLoading}
          />
        )}
        {page !== 'home' && (
          <WeekPage
            key={page}
            label={weekLabel}
            days={currentDays}
            flaggedUrls={flaggedUrls}
            onToggleFlag={toggleFlag}
            loading={weekLoading}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        )}
      </div>

      <BottomNav page={page} onNavigate={setPage} />

      <button className="logout-btn" onClick={logout} title="Sign out">
        <LogoutIcon />
      </button>
    </div>
  );
}

function BookmarkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
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

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
