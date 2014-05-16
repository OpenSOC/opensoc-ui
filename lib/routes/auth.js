exports.login = function (req, res, next) {
  req.login(req.user, function (err) {
    if (err) {
      return next(err);
    }

    // TODO: redirect to original path
    res.redirect('/');
  });
};

exports.logout = function (req, res) {
  req.logout();
  res.redirect('/login');
};

exports.check = function (req, res, next) {
};
