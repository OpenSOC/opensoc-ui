var Chance = require('chance')
	, chance = new Chance();

module.exports = function (opts) {
	var data = [];

	opts = opts || {};

	for (var i = 0; i < (opts.number || 100); i++) {
		data.push({
			email: chance.email(),
			password: chance.string(),
			name: chance.name()
		});
	}

	return data;
};
