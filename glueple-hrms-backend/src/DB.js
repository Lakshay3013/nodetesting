const mongoose = require('mongoose');
require('dotenv').config();

const connections = {}; // Cache DB connections

function getDbUriFromSubdomain(subdomain) {
  switch (subdomain?.toLowerCase()) {
    case 'aastpl':
      return {
        uri: process.env.AASTPL_DB_URI,
        dbName: process.env.AASTPL_DATABASE_NAME,
      };
    default:
      return {
        uri: process.env.MONGODB_URL,
        dbName: process.env.MONGODB_DATABASE_NAME,
      };
  }
}

async function dbConnector(req, res, next) {
  const host = req.headers.host || '';
  const subdomain = req.headers['client-code'] || 'default'; // Use default if no client-code
  console.log("🌐 Subdomain:", subdomain);

  if (connections[subdomain]) {
    console.log("♻️ Using cached connection");
    req.db = connections[subdomain];
    return next();
  }

  const { uri, dbName } = getDbUriFromSubdomain(subdomain);
  console.log("🔗 Connecting to:", uri, "DB:", dbName);

  try {
    const connection = await mongoose.createConnection(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName,
    });

    console.log(`✅ Connected to DB: ${dbName}`);
    connections[subdomain] = connection;
    req.db = connection;
    return next();
  } catch (err) {
    console.error('❌ DB connection error:', err.message);
    return res.status(500).send('Failed to connect to database');
  }
}

module.exports = dbConnector;
