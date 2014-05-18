var assert = require('chai').assert
  , expected = require('./fixtures/query-parser')
  , parser = require('../lib/modules/query-parser');

describe('query parser', function () {
  it('should parse query', function (done) {
    parser.parse('_type = fireeye', function (data) {
      assert.deepEqual(JSON.parse(data), expected);
      done();
    });
  });
});
