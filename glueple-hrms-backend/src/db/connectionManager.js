const mongoose = require('mongoose');
require('dotenv').config();


const connections = {}; // Cache to reuse DB connections

function getDbUriFromSubdomain(subdomain) {
  switch (subdomain?.toLowerCase()) {
    case 'aastpl':
      return {
        uri: process.env.AASTPL_DB_URI,
        dbName: process.env.AASTPL_DATABASE_NAME,
      };
    case 'saas':
      return {
         uri: process.env.MONGODB_URL,
        dbName: process.env.MONGODB_DATABASE_NAME,
      };
    default:
      return {
        uri: process.env.MONGODB_URL,
        dbName: process.env.MONGODB_DATABASE_NAME,
      };
  }
}

async function getTenantConnection(subdomain) {
  const {uri,dbName} = getDbUriFromSubdomain(subdomain.toUpperCase());
  if (!uri) throw new Error(`No DB config for subdomain ${subdomain}`);

  if (connections[subdomain]) {
    return connections[subdomain];
  }
 
  const conn = await mongoose.createConnection(uri, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 50000,
    keepAlive: true,
    keepAliveInitialDelay: 300000, // 5 mins
    dbName
  });
   mongoose.set('bufferCommands', false);
   

  connections[subdomain] = conn;
  return conn;

  
}



module.exports = { getTenantConnection };
