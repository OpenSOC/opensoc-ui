var express = require('express');
var router = express.Router();
var config = require('../config');
var _ = require('lodash');

router.get('/config', function (req, res, next) {
  if (config.kibana.opensoc.auth && !req.user) {
    res.send(403, 'Forbidden!');
    return;
  }

  var keys = [
    'kibana_index',
    'default_app_id',
    'shard_timeout'
  ];
  var data = _.pick(config.kibana, keys);
  data.opensoc = _.pick(config.opensoc, ['auth']);
  data.plugins = config.plugins;
  res.json(data);
});

module.exports = router;
