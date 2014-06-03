var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , LdapStrategy = require('passport-ldapauth').Strategy
  , config = require('../config')[process.env.NODE_ENV || 'dev']
  , strategy = config.ldap ? 'ldapauth' : 'local'
  , User = require('../models/user')
  , path = require('path')
  , DB = require('../helpers/db');

exports.initialize = function (app) {
  app.use(passport.initialize());
  app.use(passport.session());

  // set up ldap strategy if LDAP config exists
  if (config.ldap) {
    passport.use(new LdapStrategy({
      usernameField: 'email',
      passwordField: 'password',
      server: config.ldap
    }, function (user, done) {
      var newUser = new User({
        email: user.mail,
        name: user.cn
      });

      // try inserting into user's table
      return newUser.save().then(function (model) {
        return done(null, user);
      }).catch(function (err) {
        if (/duplicate key value violates unique constraint/.test(err.message)) {
          // already exists
          return done(null, user);
        } else {
          return done(err, user);
        }
      });
    }));
  }

  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
  }, function (email, password, done) {
      return done(null, { id: 0, email: email });
    })
  );

  // what to return back to browser
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  // what to load from DB based on browser request
  passport.deserializeUser(function (user, done) {
    // fetch user from DB
    done(null, user);
  });

  // Routes
  app.post('/login', passport.authenticate(strategy, {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }));
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
  });

  // login page
  app.get('/login', function (req, res) {
    res.sendfile(path.join(__dirname, '../public/login.html'));
  });
};
