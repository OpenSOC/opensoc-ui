var

  // LIBRARY DEPENDENCIES
    express = require('express')
  , connect = require('connect')
  , passport = require('passport')
  , cookieSession = require('express-session')
  , RedisStore = require('connect-redis')(cookieSession)
  , http = require('http')
  , path = require('path')

  // MODULES
  , session = require('./lib/modules/session')
  , parser = require('./lib/modules/query-parser')
  , kafka = require('./lib/modules/kafka')

  // VARIABLES
  , app = express()
  , cookieSecret = 'b^~BN-IdQ9{gdp5sa2K$N=d5DV06eN7Y)sjZf:69dUj.3JWq=o';


// Initialize app
app.set('port', process.env.PORT || 5000);
app.use(connect.logger('dev'));
app.use(connect.bodyParser());
app.use(connect.cookieParser());
app.use(connect.cookieSession({
  secret: process.env.COOKIE_SECRET || cookieSecret,
  store: new RedisStore(),
  cookie: {maxAge: 7 * 24 * 60 * 60 * 1000} // 7-day sessions
}));
app.use(connect.static(path.join(__dirname, 'public')));


// Initialize modules
session.initialize(app);
kafka.initialize(app);
parser.initialize(app);




// Start server
http.createServer(app).listen(app.get('port'), function () {
});

exports.app = app;
