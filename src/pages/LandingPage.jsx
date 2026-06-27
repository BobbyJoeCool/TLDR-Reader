function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function getName(user) {
  if (!user?.userDetails) return 'there';
  const raw = user.userDetails.includes('@')
    ? user.userDetails.split('@')[0]
    : user.userDetails;
  const first = raw.split('.')[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}

export default function LandingPage({ user, onNavigate, flaggedCount, savedCount }) {
  const tiles = [
    {
      id: 'home',
      label: 'Reading List',
      sub: flaggedCount ? `${flaggedCount} article${flaggedCount !== 1 ? 's' : ''} flagged` : 'Your flagged articles',
      icon: <FlagIcon />,
    },
    {
      id: 'thisWeek',
      label: 'This Week',
      sub: "This week's TLDR editions",
      icon: <CalendarIcon />,
    },
    {
      id: 'lastWeek',
      label: 'Last Week',
      sub: 'Browse last week',
      icon: <HistoryIcon />,
    },
    {
      id: 'archive',
      label: 'Archive',
      sub: 'Browse past editions by date',
      icon: <ArchiveIcon />,
    },
    {
      id: 'saved',
      label: 'Saved Articles',
      sub: savedCount ? `${savedCount} article${savedCount !== 1 ? 's' : ''} saved` : 'Your saved articles',
      icon: <StarIcon />,
    },
  ];

  return (
    <div className="landing-page">
      <div className="landing-hero">
        <h1 className="landing-brand">TLDR Reader</h1>
        <p className="landing-greeting">Good {getGreeting()}, {getName(user)}.</p>
      </div>

      <nav className="landing-tiles">
        {tiles.map((tile) => (
          <button key={tile.id} className="landing-tile" onClick={() => onNavigate(tile.id)}>
            <span className="landing-tile-icon">{tile.icon}</span>
            <span className="landing-tile-label">{tile.label}</span>
            <span className="landing-tile-sub">{tile.sub}</span>
          </button>
        ))}
      </nav>

      <section className="landing-guide">
        <h2 className="landing-guide-heading">Quick Guide</h2>
        <ul className="landing-guide-list">
          <li>
            <span className="guide-icon"><FlagIcon /></span>
            <span>Tap the <strong>flag</strong> on any article to add it to your Reading List.</span>
          </li>
          <li>
            <span className="guide-icon"><CheckIcon /></span>
            <span>Tap the <strong>check</strong> on a Reading List article to mark it as read.</span>
          </li>
          <li>
            <span className="guide-icon"><XIcon /></span>
            <span>Tap <strong>✕</strong> on a Reading List article to remove it.</span>
          </li>
          <li>
            <span className="guide-icon"><StarIcon /></span>
            <span>Tap the <strong>star</strong> on any article to save it permanently to Saved Articles.</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function FlagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
