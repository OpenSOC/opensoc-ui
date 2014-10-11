if (process.env.NODE_ENV && process.env.NODE_ENV !== 'production') {
  module.exports = require('./lib/opensoc-ui');
} else {
  // Start cluster
  var cluster = require('cluster');
  var numCPUs = require('os').cpus().length;

  if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', function (worker, code, signal) {
      console.log('worker ' + worker.process.pid + ' died');
    });
  } else {
    require('./lib/opensoc-ui');
  }
}