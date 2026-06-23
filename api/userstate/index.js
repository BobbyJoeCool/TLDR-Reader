const { userState, getUser } = require('../_shared/cosmos');

module.exports = async function (context, req) {
  const user = getUser(req);
  if (!user) {
    context.res = { status: 401, body: 'Unauthorized' };
    return;
  }

  const { userId } = user;

  if (req.method === 'GET') {
    try {
      const { resource } = await userState.item(userId, userId).read();
      context.res = { status: 200, body: resource || { id: userId, userId, flagged: [] } };
    } catch (err) {
      if (err.code === 404) {
        context.res = { status: 200, body: { id: userId, userId, flagged: [] } };
      } else {
        context.log.error('GET userstate failed:', err.message);
        context.res = { status: 500, body: 'Failed to fetch user state' };
      }
    }
    return;
  }

  if (req.method === 'POST') {
    const { action, article, url, isRead } = req.body || {};

    // Load existing state
    let state;
    try {
      const { resource } = await userState.item(userId, userId).read();
      state = resource || { id: userId, userId, flagged: [] };
    } catch (err) {
      if (err.code === 404) {
        state = { id: userId, userId, flagged: [] };
      } else {
        context.log.error('Read userstate failed:', err.message);
        context.res = { status: 500, body: 'Failed to read user state' };
        return;
      }
    }

    if (action === 'flag' && article) {
      const already = state.flagged.find(a => a.url === article.url);
      if (!already) {
        state.flagged.push({
          url: article.url,
          title: article.title,
          summary: article.summary,
          edition: article.edition,
          date: article.date,
          day: article.day,
          flaggedAt: new Date().toISOString(),
          isRead: false,
        });
      }
    } else if (action === 'unflag' && url) {
      state.flagged = state.flagged.filter(a => a.url !== url);
    } else if (action === 'read' && url !== undefined) {
      const item = state.flagged.find(a => a.url === url);
      if (item) item.isRead = !!isRead;
    } else {
      context.res = { status: 400, body: 'Unknown action' };
      return;
    }

    try {
      const { resource } = await userState.items.upsert(state);
      context.res = { status: 200, body: resource };
    } catch (err) {
      context.log.error('Save userstate failed:', err.message);
      context.res = { status: 500, body: 'Failed to save user state' };
    }
  }
};
