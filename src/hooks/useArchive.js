import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

export function useArchive() {
  const [manifest, setManifest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dayCache, setDayCache] = useState({});
  const [loadingDates, setLoadingDates] = useState({});
  const requested = useRef(new Set());

  useEffect(() => {
    fetch('/data/archive/manifest-2026.json')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load archive manifest');
        return r.json();
      })
      .then(setManifest)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const loadDay = useCallback((date) => {
    if (requested.current.has(date)) return;
    requested.current.add(date);

    const year = '2026';
    setLoadingDates((prev) => ({ ...prev, [date]: true }));

    fetch(`/data/archive/${year}/${date}/manifest.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`No data for ${date}`);
        return r.json();
      })
      .then(({ editions }) =>
        Promise.all(
          editions.map(({ name, file }) =>
            fetch(`/data/archive/${year}/${date}/${file}`)
              .then((r) => (r.ok ? r.json() : null))
              .then((data) => (data ? { name, articles: data.articles } : null))
          )
        )
      )
      .then((editions) => {
        setDayCache((prev) => ({ ...prev, [date]: editions.filter(Boolean) }));
      })
      .catch(() => {
        setDayCache((prev) => ({ ...prev, [date]: [] }));
      })
      .finally(() => {
        setLoadingDates((prev) => ({ ...prev, [date]: false }));
      });
  }, []);

  const thisWeekDays = useMemo(() => {
    const week = manifest?.weeks?.[0];
    if (!week) return [];
    return Object.entries(week.days)
      .filter(([, date]) => date !== null)
      .map(([dayKey, date]) => ({
        date,
        day: dayKey.charAt(0).toUpperCase() + dayKey.slice(1),
        editions: dayCache[date] ?? [],
      }));
  }, [manifest, dayCache]);

  const lastWeekDays = useMemo(() => {
    const week = manifest?.weeks?.[1];
    if (!week) return [];
    return Object.entries(week.days)
      .filter(([, date]) => date !== null)
      .map(([dayKey, date]) => ({
        date,
        day: dayKey.charAt(0).toUpperCase() + dayKey.slice(1),
        editions: dayCache[date] ?? [],
      }));
  }, [manifest, dayCache]);

  const availableDates = useMemo(() => {
    if (!manifest) return new Set();
    const dates = new Set();
    for (const week of manifest.weeks) {
      for (const date of Object.values(week.days)) {
        if (date) dates.add(date);
      }
    }
    return dates;
  }, [manifest]);

  return {
    loading,
    error,
    thisWeekDays,
    lastWeekDays,
    availableDates,
    loadDay,
    getDay: (date) => dayCache[date] ?? [],
    isDayLoading: (date) => !!loadingDates[date],
  };
}
