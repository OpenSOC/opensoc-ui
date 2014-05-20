var bcrypt = require('bcrypt')
	, DB = require('../helpers/db')
  , SALT_FACTOR = 10;

var encryptPassword = function (model, attrs, options) {
  bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
    if (err) {
      throw err;
    }

    bcrypt.hash(model.get('password'), salt, function (err, hash) {
      if (err) {
        throw err;
      }

      console.log('plaintext password: ' + model.get('password'));
      model.set('password', hash);
      console.log('encrypted password: ' + model.get('password'));
    });
  });
};

var model = DB.Model.extend({
	tableName: 'users',
	
	constructor: function () {
		DB.Model.apply(this, arguments);

    // encrypt cleartext password before save
		this.on('saving', encryptPassword);
	}
});

module.exports = model;
