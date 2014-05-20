var
		Bookshelf = require('bookshelf')
	, bcrypt = require('bcrypt')
	, config = require('../../database')[process.env.NODE_ENV || 'dev']
	, DB = Bookshelf.DB || Bookshelf.initialize({
			client: 'pg',
			connection: config
		});

var encryptPassword = function (pass) {
	return 'encrypted ' + pass;
};

var model = DB.Model.extend({
	tableName: 'users',
	
	constructor: function () {
		DB.Model.apply(this, arguments);
		this.on('saving', function (model, attrs, options) {
			model.set('password', encryptPassword(model.get('password')));
		});
	}
});

module.exports = model;
