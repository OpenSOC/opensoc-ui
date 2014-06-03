var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.addIndex('users', 'index_email_on_users', ['email'], callback);
};

exports.down = function(db, callback) {
  db.removeIndex('users', 'index_email_on_users', callback);
};
