var assert = require('chai').assert
  , sinon = require('sinon')
  , parser = require('../lib/modules/query-parser');

describe('query parser', function () {
  var spawned = parser.spawn();

  spawned.stdout.on = function (str, cb) {
    cb('{"hello": "world"}');
  };
  spawned.stdin.write = function () {};

  it('should run query', function (done) {
    parser.execute(spawned, '_type = fireeye', function (data) {
      var result = JSON.parse(data);
      assert.equal(result.hello, 'world');
      done();
    });
  });
});
