const EDITION_ORDER = [
  'TLDR',
  'TLDR AI',
  'TLDR Dev',
  'TLDR DevOps',
  'TLDR Product',
  'TLDR IT',
  'TLDR InfoSec',
  'TLDR Founders',
  'TLDR Design',
  'TLDR Marketing',
  'TLDR Crypto',
  'TLDR Fintech',
  'TLDR Data',
  'TLDR Hardware',
];

export function sortEditions(editions) {
  return [...editions].sort((a, b) => {
    const ai = EDITION_ORDER.indexOf(a.name);
    const bi = EDITION_ORDER.indexOf(b.name);
    if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export function defaultEdition(editions) {
  for (const name of EDITION_ORDER) {
    if (editions.find((e) => e.name === name)) return name;
  }
  return editions[0]?.name ?? null;
}

export default function EditionTabs({ editions, selectedEdition, onSelectEdition, layout }) {
  const sorted = sortEditions(editions);

  if (layout === 'sidebar') {
    return (
      <div className="edition-sidebar-group">
        <div className="sidebar-section-label">Editions</div>
        {sorted.map((e) => (
          <button
            key={e.name}
            data-edition={e.name}
            className={`edition-sidebar-item ${selectedEdition === e.name ? 'active' : ''}`}
            onClick={() => onSelectEdition(e.name)}
          >
            <span className="edition-dot" />
            <span className="edition-label">{e.name}</span>
            <span className="edition-count">{e.articles.length}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="edition-tabs" role="tablist">
      {sorted.map((e) => (
        <button
          key={e.name}
          role="tab"
          data-edition={e.name}
          aria-selected={selectedEdition === e.name}
          className={`edition-tab ${selectedEdition === e.name ? 'active' : ''}`}
          onClick={() => onSelectEdition(e.name)}
        >
          <span className="edition-tab-dot" />
          {e.name}
        </button>
      ))}
    </div>
  );
}
