var assert = require('chai').assert
  , sinon = require('sinon')
  , env = process.env.NODE_ENV || 'development'
  , kafka = require('../lib/modules/kafka');

describe('kafka', function () {
  it ('ensures read is a function', function (done) {
    assert(typeof kafka.read, 'function');
    done();
  });

  it('ensures register is a function', function (done) {
    assert(typeof kafka.register, 'function');
    done();
  });

  // TODO: stub for travis-ci.org
  if ('development' === env) {
    describe('topics', function () {
      var topic = 'test'
        , message = '{ "hello": "world" }'
        , consumed;

      // register topic first
      before(function (next) {
        console.log('before');
        kafka.register(topic, function (data) {
          console.log('data: ' + data);
        });
        next();
      });

      it('reads from topic', function (done) {
        kafka.read(topic, function (message) {
          assert.ok(message, 'message received');
          console.log(message);
          done();
        });
      });
    });
  }
});
