var kafka = require('kafka-node')
  , redis = require('redis')
  , WebSocketServer = require('ws').Server
  , env = process.env.NODE_ENV || 'dev'
  , config = require('../config')[env];

var redisClient = redis.createClient(
  config.redis.port,
  config.redis.host);

var connString = config.zookeeper.host + ':' + config.zookeeper.port;
var kafkaClient = new kafka.Client(connString);

// read messages for topic
exports.consume = function (topic, cb) {
  var options = {
    autoCommit: true,
    fromBeginning: false,
    fetchMaxWaitMs: 1000,
    fetchMaxBytes: 1024*1024
  };

  // use default partitions
  var topics = [
    { topic: topic, partition: 0 },
    { topic: topic, partition: 1 }
  ];

  var consumer = new kafka.Consumer(kafkaClient, topics, options);
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

exports.produce = function (topic, message, cb) {
  var producer = new kafka.Producer(kafkaClient);

  producer.send([{ messages: [message], topic: topic, parition: 0 }], cb);
};

// regsiter a query as a new kafka topic
exports.register = function (topic, cb) {
  var producer = new kafka.Producer(kafkaClient);

  producer.createTopics([topic], false, cb);
};

exports.initialize = function (app, server) {
  // web socket setup
  var wss = new WebSocketServer({ server: server });

  wss.on('connection', function (ws) {
    exports.consume('opensoc', function (message) {
      ws.send(message.value, function () { });
    });
  });

  // Register realtime search
  app.post('/search', function (req, res) {
    
  });

  // Read realtime search
  app.get('/search', function (req, res) {

  });

};
