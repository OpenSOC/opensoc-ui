var assert = require('assert');
var request = require('request');
var config = require('../../src/server/config/');

describe('autentication', function () {
  var baseUrl = 'http://localhost:' + config.kibana.port;
  request.defaults({ jar: true }); // Enable cookies

  it('redirects to login unless already logged in', function (done) {
    request({ url: baseUrl + '/', followRedirect: false }, function (err, res) {
      assert.equal(res.headers.location, '/login');
      assert.equal(res.statusCode, 302);
      done();
    });
  });

  it('logs in', function (done) {
    request({
      url: baseUrl + '/login',
      method: 'POST',
      followRedirect: false,
      form: { email: 'joesmith@opensoc.dev', password: 'opensoc' }
    }, function (err, res) {
      assert.equal(res.headers.location, '/');
      assert.equal(res.statusCode, 302);
      done();
    });
  });

  it('logs out', function (done) {
    request({ url: baseUrl + '/logout', followRedirect: false }, function (err, res) {
      assert.equal(res.headers.location, '/login');
      assert.equal(res.statusCode, 302);
      done();
    });
  });

  it('fails log in', function (done) {
    request({
      url: baseUrl + '/login',
      method: 'POST',
      followRedirect: false,
      form: { email: 'joesmith@opensoc.dev', password: 'monkeyMadness2015' }
    }, function (err, res) {
      assert.equal(res.headers.location, '/login');
      assert.equal(res.statusCode, 302);
      done();
    });
  });
});