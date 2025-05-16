const dotenv = require('dotenv');
dotenv.config();
// console.log("sdf",dotenv.config,process.env.MONGODB_URL)

function getDbUriFromSubdomain(subdomain) {
  switch (subdomain.toLowerCase()) {
    case 'aastpl':
      return process.env.AASTPL_MONGODB_URL || process.env.MONGODB_URL;
    case 'xyzcorp':
      return process.env.XYZCORP_MONGODB_URL || process.env.MONGODB_URL;
    default:
      return process.env.MONGODB_URL;  
  }
}

module.exports = getDbUriFromSubdomain;
