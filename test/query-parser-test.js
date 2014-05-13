var assert = require('chai').assert
  , sinon = require('sinon')
  , expected = require('./fixtures/query-parser')
  , parser = require('../lib/modules/query-parser');

describe('query parser', function () {
  it('should parse query', function (done) {
    parser.parse('_type = fireeye', function (data) {
      var result = JSON.parse(data)
        , expected = {query:{filtered:{filter:{query:{query_string:{query:"_type:fireeye"}}}}}};
      assert.deepEqual(result, expected);
      done();
    });
  });
});
