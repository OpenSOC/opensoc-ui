var

  // LIBRARY DEPENDENCIES
    express = require('express')
  , connect = require('connect')
  , cookieSession = require('express-session')
  , RedisStore = require('connect-redis')(cookieSession)
	, Bookshelf = require('bookshelf')
  , http = require('http')
  , path = require('path')
  , flash = require('connect-flash')

  // MODULES
  , session = require('./modules/session')
  , kafka = require('./modules/kafka')

  // VARIABLES
  , app = express()
	, env = process.env.NODE_ENV || 'dev'
	, config = require('./config')[env]
  , cookieSecret = 'b^~BN-IdQ9{gdp5sa2K$N=d5DV06eN7Y)sjZf:69dUj.3JWq=o';

// Initialize app
app.use(connect.logger('dev'));
app.use(connect.bodyParser());
app.use(connect.cookieParser());
app.use(connect.cookieSession({
  secret: process.env.COOKIE_SECRET || cookieSecret,
  store: new RedisStore(config.redis),
  cookie: {maxAge: 7 * 24 * 60 * 60 * 1000} // 7-day sessions
}));
app.use(connect.static(path.join(__dirname, 'public')));
app.use(flash());

// Create server
var server = http.createServer(app);

// Initialize modules
kafka.initialize(app, server);
session.initialize(app);

// Start server
server.listen(process.env.PORT || 5000);


exports.app = app;
