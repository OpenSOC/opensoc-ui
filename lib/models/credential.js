/*global _:true */

var Promise = require('bluebird')
	, _ = require('lodash')
  , Checkit = require('checkit')
	, DB = require('../helpers/db')
	, User = require('./user')
	, bcrypt = Promise.promisifyAll(require('bcrypt'));

var model = DB.Model.extend({
	softDelete: 'deleted_at',
	tableName: 'credentials',
	hasTimestamps: ['created_at', 'updated_at'],
	owner: function () {
		return this.belongsTo(User);
	},

  constructor: function (model, attrs, opts) {
    DB.Model.apply(this, arguments);
    
    this.on('saving', this.hashPassword.bind(this));
		this.on('saving', this.validate.bind(this));
  },

	hashPassword: function (model, attrs, options) {
    var self = this;

		return bcrypt.hashAsync(self.get('token'), 10).then(function (token) {
			self.set({ token: token });
		});
	},

	validations: {
		token: 'required',
    user_id: 'required'
	},

	validate: function () {
		return new Checkit(this.validations).run(this.toJSON());
	}
});

module.exports = model;
