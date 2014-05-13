var spawn = require('child_process').spawn
  , env = process.env.NODE_ENV || 'development'
  , config = require('../config')[env];

var spawnProc = function () {
  return spawn('plunk', ['-p']);
};

// parse query only, don't execute
exports.parse = function (query, cb) {
  var proc = spawnProc();

  proc.stdout.on('data', cb);
  proc.stdin.setEncoding = 'utf-8';
  proc.stdin.write(query);
  proc.stdin.end();

  return proc;
};
