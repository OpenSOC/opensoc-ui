var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
	db.createTable('users', {
		id: { type: 'int', primaryKey: true, autoIncrement: true },
		name: 'string',
		email: { type: 'string', unique: true },
		password: 'string'
	}, callback);
};

exports.down = function(db, callback) {
	db.dropTable('users', callback);
};
