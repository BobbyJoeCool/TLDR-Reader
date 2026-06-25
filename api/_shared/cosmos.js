const { CosmosClient } = require('@azure/cosmos');

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const db = client.database(process.env.COSMOS_DATABASE_NAME || 'tldr-reader');

const articles = db.container(process.env.COSMOS_ARTICLES_CONTAINER || 'articles');
const userState = db.container(process.env.COSMOS_USERSTATE_CONTAINER || 'userState');

function getUser(req) {
  const header = req.headers['x-ms-client-principal'];
  if (!header) {
    if (process.env.LOCAL_DEV === 'true') {
      return { userId: 'dev-user', userDetails: 'dev@local' };
    }
    return null;
  }
  try {
    const decoded = Buffer.from(header, 'base64').toString('ascii');
    const principal = JSON.parse(decoded);
    return { userId: principal.userId, userDetails: principal.userDetails };
  } catch {
    return null;
  }
}

function checkWriteKey(req) {
  return req.headers['x-api-key'] === process.env.API_WRITE_KEY;
}

module.exports = { articles, userState, getUser, checkWriteKey };
