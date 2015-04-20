exports = module.exports = function(app, config) {
  var _ = require('lodash');
  var passport = require('passport');
  var ldapauth = require('passport-ldapauth');

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
      ldapUser.permissions[perm] = false
      _.each(config.permissions[perm], function(group) {
        if (_.contains(memberOf, group)) {
          ldapUser.permissions[perm] = true;
        }
      })
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

  app.get('/login', function (req, res) {
    res.render('login', { flash: req.flash() });
  });

  app.post('/login', passport.authenticate('ldapauth', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }));

  // TODO(ram) Check logged in with app.use here.

  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
  });
};