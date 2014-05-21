var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
	db.createTable('credentials', {
		id: { type: 'int', primaryKey: true, autoIncrement: true },
		user_id: 'int',
		token: 'string'
	}, callback);
};

exports.down = function(db, callback) {
	db.dropTable('credentials', callback);
};
