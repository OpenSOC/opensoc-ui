var assert = require('chai').assert
  , sinon = require('sinon')
  , kafka = require('../lib/modules/kafka');

describe('kafka', function () {
  it ('ensures read is a function', function (done) {
    assert(typeof kafka.read, 'function');
    done();
  });

  it('throws exception when success handler is omitted', function (done) {
    assert.throw(kafka.read, "Must pass success callback");
    done();
  });
});
