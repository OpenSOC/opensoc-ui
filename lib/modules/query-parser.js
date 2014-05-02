var spawn = require('child_process').spawn
  , settings = require('./settings');

exports.execute = function (proc, query, cb) {
  proc.stdout.on('data', cb);
  proc.stdin.setEncoding = 'utf-8';
  proc.stdin.write(query);
  proc.stdin.end();

  return proc;
};

exports.spawn = function () {
  var hosts = settings.elasticsearch().hosts;
  return spawn('plunk', ['-h', hosts]);
};
