import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

export function useUserState(user) {
  const [flagged, setFlagged] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api
      .getUserState()
      .then((state) => setFlagged(state.flagged || []))
      .catch(() => setFlagged([]))
      .finally(() => setLoading(false));
  }, [user]);

  const flaggedUrls = new Set(flagged.map((a) => a.url));

  const toggleFlag = useCallback(
    async (article) => {
      if (flaggedUrls.has(article.url)) {
        setFlagged((prev) => prev.filter((a) => a.url !== article.url));
        await api.unflagArticle(article.url);
      } else {
        const optimistic = {
          ...article,
          flaggedAt: new Date().toISOString(),
          isRead: false,
        };
        setFlagged((prev) => [...prev, optimistic]);
        await api.flagArticle(article);
      }
    },
    [flaggedUrls]
  );

  const toggleRead = useCallback(async (url) => {
    setFlagged((prev) =>
      prev.map((a) => (a.url === url ? { ...a, isRead: !a.isRead } : a))
    );
    const current = flagged.find((a) => a.url === url);
    if (current) await api.setRead(url, !current.isRead);
  }, [flagged]);

  // Sort: newest newsletter date first, then by flaggedAt within same date
  const sortedFlagged = [...flagged].sort((a, b) => {
    const dateDiff = new Date(b.date) - new Date(a.date);
    if (dateDiff !== 0) return dateDiff;
    return new Date(b.flaggedAt) - new Date(a.flaggedAt);
  });

  return { flagged: sortedFlagged, flaggedUrls, loading, toggleFlag, toggleRead };
}
