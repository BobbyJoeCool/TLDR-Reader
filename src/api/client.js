async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}

export const api = {
  getUserState: () => apiFetch('/api/userstate'),
  flagArticle: (article) =>
    apiFetch('/api/userstate', { method: 'POST', body: { action: 'flag', article } }),
  unflagArticle: (url) =>
    apiFetch('/api/userstate', { method: 'POST', body: { action: 'unflag', url } }),
  setRead: (url, isRead) =>
    apiFetch('/api/userstate', { method: 'POST', body: { action: 'read', url, isRead } }),
};
