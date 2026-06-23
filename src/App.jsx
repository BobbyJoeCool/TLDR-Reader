import { useState } from 'react';
import './App.css';
import { useAuth } from './hooks/useAuth';
import { useArticles } from './hooks/useArticles';
import { useUserState } from './hooks/useUserState';
import AuthGate from './components/AuthGate';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import WeekPage from './pages/WeekPage';
import { useMediaQuery } from './hooks/useMediaQuery';

export default function App() {
  const [page, setPage] = useState('home');
  const { user, login, logout } = useAuth();
  const useSidebar = useMediaQuery('(min-width: 768px) and (orientation: landscape), (min-width: 1024px)');

  const { days: thisWeekDays, loading: twLoading } = useArticles('thisWeek');
  const { days: lastWeekDays, loading: lwLoading } = useArticles('lastWeek');
  const { flagged, flaggedUrls, loading: usLoading, toggleFlag, toggleRead } = useUserState(user);

  const handleUnflag = (url) => toggleFlag({ url });

  if (user === undefined) {
    return <AuthGate user={user} login={login} />;
  }

  if (user === null) {
    return <AuthGate user={user} login={login} />;
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
        {page === 'thisWeek' && (
          <WeekPage
            label="This Week"
            days={thisWeekDays}
            flaggedUrls={flaggedUrls}
            onToggleFlag={toggleFlag}
            loading={twLoading}
            useSidebar={useSidebar}
          />
        )}
        {page === 'lastWeek' && (
          <WeekPage
            label="Last Week"
            days={lastWeekDays}
            flaggedUrls={flaggedUrls}
            onToggleFlag={toggleFlag}
            loading={lwLoading}
            useSidebar={useSidebar}
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

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
