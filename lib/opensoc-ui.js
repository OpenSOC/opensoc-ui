var express = require('express')
  , connect = require('connect')
  , session = require('express-session')
  , RedisStore = require('connect-redis')(session)
  , app = express()
  , parserRouter = require('./routes/parser')
  , http = require('http')
  , path = require('path')
  , cookieSecret = 'b^~BN-IdQ9{gdp5sa2K$N=d5DV06eN7Y)sjZf:69dUj.3JWq=o';

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

app.get('/parse', parserRouter.parse);

// Start server
http.createServer(app).listen(app.get('port'), function () {
});

exports.app = app;
