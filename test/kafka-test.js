var assert = require('chai').assert
  , Chance = require('chance')
  , env = process.env.NODE_ENV || 'development'
  , kafka = require('../lib/modules/kafka');

describe('kafka', function () {
  // TODO: stub for travis-ci.org
  if (!process.env.IN_TRAVIS) {
    describe('topics', function () {
      var topic = 'opensoc-test'
        , chance = new Chance()
        , message = chance.paragraph()
        , consumed;

      // register topic first
      before(function (next) {
        kafka.register(topic, next);
      });

      before(function (next) {
        kafka.produce(topic, message, next);
      });

      it('reads from topic', function (done) {
        kafka.consume(topic, function (received) {
          assert.ok(received, 'message received');
          assert.equal(received.value, message);
          done();
        });
      });
    });
  }
});
