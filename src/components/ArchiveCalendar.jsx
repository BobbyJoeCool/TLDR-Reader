import { useState } from 'react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ArchiveCalendar({ availableDates, selectedDate, onSelectDate }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);

  const todayStr = today.toLocaleDateString('en-CA');

  let minYear = today.getFullYear();
  let minMonth = today.getMonth() + 1;
  if (availableDates.size > 0) {
    const earliest = [...availableDates].sort()[0];
    minYear = parseInt(earliest.slice(0, 4));
    minMonth = parseInt(earliest.slice(5, 7));
  }

  const maxYear = today.getFullYear();
  const maxMonth = today.getMonth() + 1;
  const canGoPrev = viewYear > minYear || (viewYear === minYear && viewMonth > minMonth);
  const canGoNext = viewYear < maxYear || (viewYear === maxYear && viewMonth < maxMonth);

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1); }
    else setViewMonth(m => m + 1);
  };

  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay();
  const startOffset = (firstDayOfWeek + 6) % 7; // Mon=0 … Sun=6

  const pad = (n) => String(n).padStart(2, '0');

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="archive-calendar">
      <div className="calendar-nav">
        <button
          className="calendar-nav-btn"
          onClick={prevMonth}
          disabled={!canGoPrev}
          aria-label="Previous month"
        >
          <ChevronLeft />
        </button>
        <span className="calendar-month-label">
          {MONTH_NAMES[viewMonth - 1]} {viewYear}
        </span>
        <button
          className="calendar-nav-btn"
          onClick={nextMonth}
          disabled={!canGoNext}
          aria-label="Next month"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="calendar-grid">
        {DAY_HEADERS.map(h => (
          <div key={h} className="calendar-day-header">{h}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} className="calendar-cell calendar-cell--empty" />;
          const dateStr = `${viewYear}-${pad(viewMonth)}-${pad(day)}`;
          const isAvailable = availableDates.has(dateStr);
          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === todayStr;
          const cls = [
            'calendar-cell',
            isAvailable ? 'calendar-cell--available' : 'calendar-cell--unavailable',
            isSelected && 'calendar-cell--selected',
            isToday && 'calendar-cell--today',
          ].filter(Boolean).join(' ');
          return (
            <button
              key={dateStr}
              className={cls}
              disabled={!isAvailable}
              onClick={() => onSelectDate(dateStr)}
              aria-label={dateStr}
              aria-pressed={isSelected}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
