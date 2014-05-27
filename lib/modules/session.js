var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , User = require('../models/user')
  , path = require('path')
  , DB = require('../helpers/db');

exports.initialize = function (app) {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
  },
    function (email, password, done) {
      // e.g. check user/pass, then...
      console.log('AUTHENTICATING WITH EMAIL:' + email + ', PASS:' + password);
      return done(null, { id: 0, email: email });
    })
  );

  // what to return back to browser
  passport.serializeUser(function (user, done) {
    console.log('serializeUser: ');
    console.log(user);
    done(null, user);
  });

  // what to load from DB based on browser request
  passport.deserializeUser(function (user, done) {
    // fetch user from DB
    console.log('deserializeUser: ');
    console.log(user);
    done(null, user);
  });

  // Routes
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
    res.sendfile(path.join(__dirname, '../public/login.html'));
  });
};
