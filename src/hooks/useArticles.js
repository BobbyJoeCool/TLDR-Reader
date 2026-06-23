import { useState, useEffect } from 'react';

export function useArticles(weekType) {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const folder = weekType === 'lastWeek' ? 'last-week' : 'this-week';

    fetch(`/data/${folder}/index.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`No ${folder} data`);
        return res.json();
      })
      .then((dates) =>
        Promise.all(
          dates.map((date) =>
            fetch(`/data/${folder}/${date}.json`).then((r) => {
              if (!r.ok) throw new Error(`Failed to load ${date}`);
              return r.json();
            })
          )
        )
      )
      .then(setDays)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [weekType]);

  return { days, loading, error };
}
