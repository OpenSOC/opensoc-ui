var dbm = require('db-migrate');
var async = require('async');
var type = dbm.dataType;

exports.up = function(db, callback) {
	var typeDef = { type: 'timestamp with time zone' };
	async.parallel([
		db.addColumn.bind(db, 'users', 'created_at', typeDef),
		db.addColumn.bind(db, 'users', 'updated_at', typeDef),
		db.addColumn.bind(db, 'credentials', 'created_at', typeDef),
		db.addColumn.bind(db, 'credentials', 'updated_at', typeDef)
	], callback);
};

exports.down = function(db, callback) {
	async.parallel([
		db.removeColumn.bind(db, 'users', 'created_at'),
		db.removeColumn.bind(db, 'users', 'updated_at'),
		db.removeColumn.bind(db, 'credentials', 'created_at'),
		db.removeColumn.bind(db, 'credentials', 'updated_at')
	], callback);
};
