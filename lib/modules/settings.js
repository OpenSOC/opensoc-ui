var env = process.env.NODE_ENV || 'development'
  , config = require('../config');

exports.elasticsearch = function () {
  return config[env] ? config[env].elasticsearch : { hosts: [] };
};
