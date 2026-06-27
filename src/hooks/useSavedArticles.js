import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

export function useSavedArticles(user) {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api
      .getSavedArticles()
      .then((data) => { setSaved(data.saved || []); setError(null); })
      .catch((err) => {
        console.error('Failed to load saved articles:', err);
        setError('Failed to load saved articles. Please refresh.');
        setSaved([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const savedUrls = new Set(saved.map((a) => a.url));

  const toggleSave = useCallback(
    async (article) => {
      if (savedUrls.has(article.url)) {
        setSaved((prev) => prev.filter((a) => a.url !== article.url));
        try {
          await api.unsaveArticle(article.url);
        } catch (err) {
          console.error('Failed to unsave article:', err);
          setSaved((prev) => {
            if (prev.find((a) => a.url === article.url)) return prev;
            return [...prev, article];
          });
        }
      } else {
        const optimistic = { ...article, savedAt: new Date().toISOString() };
        setSaved((prev) => [...prev, optimistic]);
        try {
          await api.saveArticle(article);
        } catch (err) {
          console.error('Failed to save article:', err);
          setSaved((prev) => prev.filter((a) => a.url !== article.url));
        }
      }
    },
    [savedUrls]
  );

  return { saved, savedUrls, loading, error, toggleSave };
}
