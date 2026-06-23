const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_SHORT = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri' };

export default function DayTabs({ days, selectedDay, onSelectDay }) {
  const sorted = [...days].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
  );

  return (
    <div className="day-tabs" role="tablist">
      {sorted.map((d) => (
        <button
          key={d.date}
          role="tab"
          aria-selected={selectedDay === d.date}
          className={`day-tab ${selectedDay === d.date ? 'active' : ''}`}
          onClick={() => onSelectDay(d.date)}
        >
          {DAY_SHORT[d.day] ?? d.day.slice(0, 3)}
        </button>
      ))}
    </div>
  );
}
