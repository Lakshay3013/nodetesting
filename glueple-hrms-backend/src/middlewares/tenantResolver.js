const { getTenantConnection } = require('../db/connectionManager');
const appHelper = require('../modules/api/utils/appHelper')

function extractSubdomain(hostname) {
  return hostname.split('.')[0].toLowerCase(); // aastpl.glueple.com → 'aastpl'
}

module.exports = async function tenantResolver(req, res, next) {
  try {
    // const host = req.headers.host; // e.g., aastpl.glueple.com
    const host = req.headers['client-code'] || 'default'
    // const subdomain = extractSubdomain(host);
    const subdomain = host
    
    req.db = await getTenantConnection(subdomain);
    req.tenant = subdomain;

    appHelper.requestContext.run({ db:req.db  }, () => {
    next();
  });

    // next();
  } catch (err) {
    console.error('Tenant DB Connection error:', err.message);
    res.status(500).json({ error: 'Database connection failed.' });
  }
};
