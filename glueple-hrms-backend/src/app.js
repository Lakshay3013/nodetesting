const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const flash = require('express-flash');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./helpers/ApiError');
const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Kolkata");
const dbConnector = require('./DB')


const tenantResolver = require('./middlewares/tenantResolver');

require('./cron/index')()

const sessionStore = new session.MemoryStore();
const MongoStore = require('connect-mongo');
const { getTenantConnection } = require('./db/connectionManager');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// flash & session
app.use(cookieParser('kCJyvubJFzUzgxVk'));
app.use(
  session({
    cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: false },
    saveUninitialized: false,
    resave: false,
    secret: 'Mz7XFOU0xJ6tScTy',
    store: MongoStore.create({
      mongoUrl: 'mongodb://127.0.0.1:27017/glueple',
    }),
  })
);
app.use(flash());

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// app.use(dbConnector)

app.use(tenantResolver)


// enable cors
app.use(
  cors({
    origin: [
      'http://192.168.5.32',
      'http://192.168.5.32:3000',
      'http://192.168.5.32:3001',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://saas.glueple.com:3001',
      'https://saas.glueple.com',
      "https://aastpl.glueple.com",
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);
// app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', apiRoutes);
app.use('/', adminRoutes);
app.get('/status', (request, response) => {
  const status = {
    status: 'working',
  };

  response.send(status);
});

app.use(function (req, res, next) {
  res.locals.nonce = Buffer.from(Date.now().toString()).toString('base64');
  res.locals.currentUri = req.path.split('/');
  if (req.session.flashSuccess || req.session.flashError) {
    res.locals.flashSuccess = req.session.flashSuccess;
    res.locals.flashError = req.session.flashError;
    delete req.session.flashSuccess;
    delete req.session.flashError;
  }
  res.locals.authData = req.session.authData;
  res.set(
    'Content-Security-Policy',
    "default-src *;  style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'; img-src * 'self' data: https:;"
  );
  next();
});

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);
app.locals.baseUrls = {
  admin: `${config.url}`,
  api: `${config.url}v1/`,
};

app.locals.config = config;

module.exports = app;
