var Checkit = require('checkit')
	, Credential = require('./credential')
	, DB = require('../helpers/db');

var model = DB.Model.extend({
	softDelete: 'deleted_at',
	tableName: 'users',
	hasTimestamps: ['created_at', 'updated_at'],

	constructor: function () {
		DB.Model.apply(this, arguments);

		this.on('saving', this.validate.bind(this));
	},

	credentials: function () {
		return this.hasMany(Credential);
	},

	validations: {
		email: ['required', 'email'],
		name: 'required'
	},

	validate: function () {
		return new Checkit(this.validations).run(this.toJSON());
	}
});

module.exports = model;
