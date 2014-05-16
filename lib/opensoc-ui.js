var express = require('express')
  , connect = require('connect')
  , passport = require('passport')
  , session = require('express-session')
  , RedisStore = require('connect-redis')(session)
  , app = express()
  , parserRouter = require('./routes/parser')
  , auth = require('./routes/auth')
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

// Auth / Sessions
app.use(passport.initialize());
app.use(passport.session());

var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function (username, password, done) {
    // e.g. check user/pass, then...
    return done(null, { id: 0, username: 'foo' });
  })
);

// what to return back to browser
passport.serializeUser(function (user, done) {
  done(null, true);
});

// what to load from DB based on browser request
passport.deserializeUser(function (id, done) {
  done(null, { username: 'foo', password: 'hashed password' });
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));
app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/login');
});

// login page
app.get('/login', function (req, res) {
  res.send('example login page');
});




app.get('/parse', parserRouter.parse);

// Start server
http.createServer(app).listen(app.get('port'), function () {
});

exports.app = app;
