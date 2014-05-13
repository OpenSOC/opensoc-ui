// wrap kafka-node to abstract away unneeded functionality
var kafka = require('kafka-node')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../config')[env]
  , client = new kafka.Client([
    config.zookeeper.host,
    config.zookeeper.port].join(':') + 'kafka0.8');

exports.read = function (opts) {
  var options = {
    autoCommit: false,
    fromBeginning: false,
    fetchMaxWaitMs: 1000,
    fetchMaxBytes: 1024*1024
  }, consumer = new kafka.Consumer(client, [], options);


};

// regsiter a query as a new kafka topic
exports.register = function (topic) {
  var producer = new kafka.Producer(client);

  producer.createTopics([topic], false, function (err, data) {
    if (err) {
      throw err;
    }

    console.log(data);
  });
};
