var assert = require('chai').assert
  , sinon = require('sinon')
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
});
