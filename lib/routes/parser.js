var parser = require('../modules/query-parser');

exports.parse = function (req, res) {
  parser.execute(parser.spawn(), req.query.query, function (data) {
    res.send(data);
  });
};
