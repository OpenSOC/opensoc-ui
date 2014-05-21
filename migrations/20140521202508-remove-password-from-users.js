var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
	db.removeColumn('users', 'password', callback);
};

exports.down = function(db, callback) {
	db.addColumn('users', 'password', { type: 'string' }, callback);
};
