var
  _ = require('lodash')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , LdapStrategy = require('passport-ldapauth').Strategy
  , path = require('path');


exports.initialize = function (app) {
  var config = app.config;

  app.use(passport.initialize());
  app.use(passport.session());

  // set up ldap strategy if LDAP config exists
  passport.use(new LdapStrategy({
    usernameField: 'email',
    passwordField: 'password',
    server: app.config.ldap
  }, function (user, done) {
      return done(null, user);
  }));

  // what to serialize into the session
  passport.serializeUser(function (ldapUser, done) {
    // ensure that memberOf is an array.
    var memberOf = ldapUser.memberOf || [];
    memberOf = _.isArray(memberOf) ? memberOf : [memberOf];
    ldapUser.memberOf = memberOf;

    // set permissions
    ldapUser.permissions = {};
    var permissions = _.keys(app.config.permissions);
    _.each(permissions, function (perm) {
      var group = app.config.permissions[perm];
      ldapUser.permissions[perm] = _.contains(memberOf, group);
    });

    done(null, JSON.stringify(ldapUser));
  });

  // what to load from the serialized session
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
        elasticsearch: app.config.elasticsearch.url
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
};
