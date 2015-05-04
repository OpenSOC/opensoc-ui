var assert = require('assert');
var request = require('request');
var config = require('../../src/server/config/');

describe('autentication', function () {
  var baseUrl = 'http://localhost:' + config.kibana.port;
  request.defaults({ jar: true }); // Enable cookies

  it('responds with success', function (done) {
    request({
      url: baseUrl + '/',
      headers: { Accept: 'text/html' },
      followRedirect: false
    }, function (err, res) {
      assert.equal(/html/.test(res.headers['content-type']), true);
      assert.equal(res.statusCode, 302);
      done();
    });
  });
});