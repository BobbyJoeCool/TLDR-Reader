import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

export function useUserState(user) {
  const [flagged, setFlagged] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api
      .getUserState()
      .then((state) => { setFlagged(state.flagged || []); setError(null); })
      .catch((err) => {
        console.error('Failed to load user state:', err);
        setError('Failed to load your reading list. Please refresh.');
        setFlagged([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const flaggedUrls = new Set(flagged.map((a) => a.url));

  const toggleFlag = useCallback(
    async (article) => {
      if (flaggedUrls.has(article.url)) {
        setFlagged((prev) => prev.filter((a) => a.url !== article.url));
        try {
          await api.unflagArticle(article.url);
        } catch (err) {
          console.error('Failed to unflag article:', err);
          setFlagged((prev) => {
            if (prev.find((a) => a.url === article.url)) return prev;
            return [...prev, article];
          });
        }
      } else {
        const optimistic = {
          ...article,
          flaggedAt: new Date().toISOString(),
          isRead: false,
        };
        setFlagged((prev) => [...prev, optimistic]);
        try {
          await api.flagArticle(article);
        } catch (err) {
          console.error('Failed to flag article:', err);
          setFlagged((prev) => prev.filter((a) => a.url !== article.url));
        }
      }
    },
    [flaggedUrls]
  );

  const toggleRead = useCallback(async (url) => {
    setFlagged((prev) =>
      prev.map((a) => (a.url === url ? { ...a, isRead: !a.isRead } : a))
    );
    const current = flagged.find((a) => a.url === url);
    if (current) {
      try {
        await api.setRead(url, !current.isRead);
      } catch (err) {
        console.error('Failed to update read state:', err);
        setFlagged((prev) =>
          prev.map((a) => (a.url === url ? { ...a, isRead: current.isRead } : a))
        );
      }
    }
  }, [flagged]);

  // Sort: newest newsletter date first, then by flaggedAt within same date
  const sortedFlagged = [...flagged].sort((a, b) => {
    const dateDiff = new Date(b.date) - new Date(a.date);
    if (dateDiff !== 0) return dateDiff;
    return new Date(b.flaggedAt) - new Date(a.flaggedAt);
  });

  return { flagged: sortedFlagged, flaggedUrls, loading, error, toggleFlag, toggleRead };
}
