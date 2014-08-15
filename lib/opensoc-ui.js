var

  // LIBRARY DEPENDENCIES
    _ = require('lodash')
  , express = require('express')
  , connect = require('connect')
  , cookieSession = require('express-session')
	, http = require('http')
  , path = require('path')
  , flash = require('connect-flash')

  // MODULES
  , session = require('./modules/session')
  , pcap = require('./modules/pcap')

  // VARIABLES
  , app = express()
	, env = process.env.NODE_ENV || 'dev'
	, config = require('./config')[env]
  , cookieSecret = 'b^~BN-IdQ9{gdp5sa2K$N=d5DV06eN7Y)sjZf:69dUj.3JWq=o';

try {
  config = _.merge(config, require('../config'));
  console.log('Loaded config overrides');
} catch(err) {
  console.log('No config overrides provided');
}

// Initialize app
app.config = config;
app.use(connect.logger('dev'));
app.use(connect.bodyParser());
app.use(connect.cookieParser());
app.use(connect.cookieSession({
  secret: process.env.COOKIE_SECRET || cookieSecret,
  cookie: {maxAge: 7 * 24 * 60 * 60 * 1000} // 7-day sessions
}));
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'views/'));
app.use(flash());

// Create server
var server = http.createServer(app);

// Initialize modules
pcap.initialize(app, server);
session.initialize(app);

// Serve static assets
app.use(connect.static(path.join(__dirname, 'public')));

// Start server
server.listen(process.env.PORT || 5000);


exports.app = app;
