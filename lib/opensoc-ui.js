var _ = require('lodash');
var http = require('http');
var path = require('path');

var express = require('express');

var connect = require('connect');
var flash = require('connect-flash')

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');

var passport = require('passport');
var ldapauth = require('passport-ldapauth');

var esProxy = require('./modules/es-proxy');
var pcap = require('./modules/pcap');

var app = express();
var env = process.env.NODE_ENV || 'vagrant';
var config = require('./config')[env];


try {
  config = _.merge(config, require('../config'));
  console.log('Loaded config overrides');
} catch(err) {
  console.log('No config overrides provided');
}

app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'views/'));

// Cookie middleware
app.use(connect.logger('dev'));
app.use(flash());
app.use(cookieParser());
app.use(cookieSession({
  secret: config.secret,
  cookie: {maxAge: 1 * 24 * 60 * 60 * 1000} // 1-day sessions
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/__es", esProxy(config));
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())


// LDAP integration
passport.use(new ldapauth.Strategy({
  usernameField: 'email',
  passwordField: 'password',
  server: config.ldap
}, function (user, done) {
    return done(null, user);
}));


// Serialize LDAP user into session.
passport.serializeUser(function (ldapUser, done) {
  // ensure that memberOf is an array.
  var memberOf = ldapUser.memberOf || [];
  memberOf = _.isArray(memberOf) ? memberOf : [memberOf];
  ldapUser.memberOf = memberOf;

  // LDAP permissions
  ldapUser.permissions = {};
  var permissions = _.keys(config.permissions);
  _.each(permissions, function (perm) {
    var group = config.permissions[perm];
    ldapUser.permissions[perm] = _.contains(memberOf, group);
  });

  done(null, JSON.stringify(ldapUser));
});


// De-serialize user from session.
passport.deserializeUser(function (ldapUser, done) {
  try {
    done(null, JSON.parse(ldapUser));
  } catch(err) {
    done(null, null);
  }
});


// routes
app.get('/', function (req, res, next) {
  if (!req.user) {
    res.redirect('/login');
    return;
  }

  res.render('index', {
    user: JSON.stringify(req.user),
    config: JSON.stringify({
      elasticsearch: config.elasticsearch.url
    })
  });
});

app.get('/login', function (req, res) {
  res.render('login', { flash: req.flash() });
});

app.post('/login', passport.authenticate('ldapauth', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/login');
});


// Serve static assets
app.use(connect.static(path.join(__dirname, 'public')));


// Start server
var server = http.createServer(app);
pcap.initialize(app, server);
server.listen(config.port || 5000);

exports.app = app;
