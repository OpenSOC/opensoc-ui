/*global assert: true*/

if (!process.env.IN_TRAVIS) {
  var assert = require('chai').assert
    , Chance = require('chance')
    , env = process.env.NODE_ENV || 'dev'
    , kafka = require('../lib/modules/kafka');

  describe('kafka', function () {
    describe('topics', function () {
      var chance = new Chance()
        , message = chance.paragraph()
        , topic = 'test-' + chance.word()
        , consumed;

      // register topic first
      before(function (next) {
        kafka.register(topic, next);
      });

      before(function (next) {
        // wait a bit for kafka to determine topic leader
        setTimeout(function () {
          kafka.produce(topic, message, next);
        }, 1000);
      });

      it('reads from topic', function (done) {
        kafka.consume(topic, function (received) {
          assert.ok(received, 'message received');
          assert.equal(received.value, message);
          done();
        });
      });
    });
  });
}
