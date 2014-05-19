var kafka = require('kafka-node')
  , redis = require('redis')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../config')[env];

var redisClient = redis.createClient(
  config.redis.port,
  config.redis.host);

var kafkaClient = new kafka.Client(
  config.zookeeper.host + ':' + config.zookeeper.port + '/kafka0.8');

// read messages for topic
exports.read = function (topic, cb) {
  var options = {
    autoCommit: false,
    fromBeginning: false,
    fetchMaxWaitMs: 1000,
    fetchMaxBytes: 1024*1024
  };
  var consumer = new kafka.Consumer(kafkaClient, [topic], options);
  var offset = new kafka.Offset(kafkaClient);

  consumer.on('message', cb);

  consumer.on('error', function (err) {
    throw err;
  });

  // recompute offset
  consumer.on('offsetOutOfRange', function (topic) {
    topic.maxNum = 2;

    offset.fetch([topic], function (err, offsets) {
      var min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
      consumer.setOffset(topic.topic, topic.partition, min);
    });
  });
};

// regsiter a query as a new kafka topic
exports.register = function (topic, cb) {
  var producer = new kafka.Producer(kafkaClient);

  producer.createTopics([topic], false, function (err, data) {
    if (err) {
      throw err;
    }

    cb(data);
  });
};

exports.initialize = function (app) {

};
