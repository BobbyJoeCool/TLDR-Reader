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
      const { resources } = await userState.items.query({
        query: 'SELECT * FROM c WHERE c.userId = @userId',
        parameters: [{ name: '@userId', value: userId }],
      }).fetchAll();
      const doc = resources[0] || {};
      context.res = { status: 200, body: { saved: doc.saved || [] } };
    } catch (err) {
      context.log.error('GET savedarticles failed:', err.message);
      context.res = { status: 500, body: 'Failed to fetch saved articles' };
    }
    return;
  }

  if (req.method === 'POST') {
    const { action, article, url } = req.body || {};

    let state;
    try {
      const { resources } = await userState.items.query({
        query: 'SELECT * FROM c WHERE c.userId = @userId',
        parameters: [{ name: '@userId', value: userId }],
      }).fetchAll();
      state = resources[0] || { id: userId, userId, flagged: [], saved: [] };
      if (!state.saved) state.saved = [];
    } catch (err) {
      context.log.error('Read savedarticles failed:', err.message);
      context.res = { status: 500, body: 'Failed to read saved articles' };
      return;
    }

    if (action === 'save' && article) {
      const already = state.saved.find(a => a.url === article.url);
      if (!already) {
        state.saved.push({
          url: article.url,
          title: article.title,
          summary: article.summary,
          edition: article.edition,
          date: article.date,
          savedAt: new Date().toISOString(),
        });
      }
    } else if (action === 'unsave' && url) {
      state.saved = state.saved.filter(a => a.url !== url);
    } else {
      context.res = { status: 400, body: 'Unknown action' };
      return;
    }

    try {
      const { resource } = await userState.items.upsert(state);
      context.res = { status: 200, body: { saved: resource.saved } };
    } catch (err) {
      context.log.error('Save savedarticles failed:', err.message);
      context.res = { status: 500, body: 'Failed to save articles' };
    }
  }
};
