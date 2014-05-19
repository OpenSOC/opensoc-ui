var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;



exports.initialize = function (app) {
  app.use(passport.initialize());
  app.use(passport.session());

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
    res.send('example login page');
  });
};
