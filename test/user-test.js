/*global assert: true*/

var assert = require('chai').assert
  , Chance = require('chance')
  , chance = new Chance()
  , User = require('../lib/models/user')
  , Credential = require('../lib/models/credential');

describe('users', function () {
  var email = chance.email()
    , password = chance.string()
    , name = chance.name()
    , user = new User({ name: name, email: email });

  describe('creates', function () {
    before(function (next) {
      user.save().then(function (model) {
        new Credential({
          user_id: model.get('id'),
          token: password
        }).save().then(function () { next(); });
      });
    });

    it('creates credential', function (done) {
      user.fetch({ withRelated: ['credentials'] }).then(function (model) {
        model.related('credentials').fetchOne().then(function (cred) {
          assert.ok(cred.get('token'));
          assert.notEqual(cred.get('token'), password);
          done();
        });
      });
    });
  });

  describe('validates', function () {
    before(function (next) {
      user.set('name', null);
      next();
    });

    it('validates user', function (done) {
      user.save().catch(function (err) {
        assert.equal(err.errors.name.message, 'The name is required');
        done();
      });
    });
  });
});
