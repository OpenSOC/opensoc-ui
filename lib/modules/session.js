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
      console.log('AUTHED');
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
      return done(null, { email: email });
    })
  );

  // what to serialize into the session
  passport.serializeUser(function (ldapUser, done) {
    // mail is a unique constraint
    done(null, ldapUser.mail);
  });

  // what to load from the serialized session
  passport.deserializeUser(function (email, done) {
    var user = new User({ email: email });

    user.fetch().then(function (model) {
      done(null, model.attributes);
    });
  });

  // Routes
  var rootRoute = function (req, res, next) {
    // check for valid session
    if (req.user) {
      next();
    } else {
      res.redirect('/login');
    }
  };

  app.get('/', rootRoute);

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
