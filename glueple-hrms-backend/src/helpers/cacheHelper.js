const NodeCache = require('node-cache');

 // Cache items never expire by default, but checks every 10 minutes for garbage collection
 const myCache = new NodeCache({ stdTTL: 300, checkperiod: 600 });

// Function to set a cache item
function setCache(key, value, ttl = 0) {
   if (ttl > 0) myCache.set(key, value, ttl);
   else myCache.set(key, value);
}

// Function to get a cache item
function getCache(key) {
  return myCache.get(key);
}

// Function to clear the entire cache
function clearCache() {
  myCache.flushAll();
}

function deleteCache(key) {
  myCache.del(key);
}

module.exports = { setCache, getCache, clearCache, deleteCache };