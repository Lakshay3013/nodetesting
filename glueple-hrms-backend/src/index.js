const mongoose = require('mongoose');
const fs = require('fs');
const http = require('http');
const https = require('https');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const { getTenantConnection } = require('./db/connectionManager');

let server;

// mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
//   logger.info('Connected to MongoDB');
//   console.log('--env--', config.env);
  

//   // server = app.listen(config.port, () => {
//   //   logger.info(`Listening to port ${config.port}`);
//   // });
// });

(async () => {
  try {
    await getTenantConnection('default');
    console.log('✅ Default DB connected');
    if (config.env === 'production') {
    const options = {
      key: fs.readFileSync(`/etc/letsencrypt/live/saas.glueple.com/privkey.pem`), // ssl.key
      cert:fs.readFileSync(`/etc/letsencrypt/live/saas.glueple.com/fullchain.pem`), // ssl.cert 
    };
   
    server = https.createServer(options, app).listen(config.port, () => {
      logger.info(`🚀 HTTPS Server is running on port ${config.port}`);
  });
  } else {
    // http development server
    server = http.createServer(app).listen(config.port, () => {
      logger.info(`🚀 HTTP Server is running on port ${config.port}`);
    });
  }
  } catch (error) {
    console.error('❌ DB connection failed:', error);
  }
})();



const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
