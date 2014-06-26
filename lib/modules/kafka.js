var kafka = require('kafka-node')
  , redis = require('redis')
  , xxhash = require('xxhashjs')
  , path = require('path')
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
    autoCommit: false,
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

  return consumer;
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
  var wss = new WebSocketServer({
    server: server,
    clientTracking: true,
    path: '/alert'
  });

  // alerts are stored in database 0
  redisClient.select(0, function () {
    // TODO: read saved topics / Dashboards from Redis / Elasticsearch
    exports.register('opensoc', function () {
      console.log('Registered topic: opensoc');

      exports.consume('opensoc', function (message) {
        // each alert needs a unique identifier to determine if we've read it
        var toHash = message.topic + ':' +
          message.offset + ':' +
          message.partition + ':' +
          message.value;
        var key = xxhash(toHash, 1).toString(16);
        var countKey = 'alert-count';
        var timestampKey = 'alert-timestamp';
        var valueKey = 'alert-value';

        // don't re-read alerts from kafka
        var op = redisClient.hexists(countKey, key, function (err, result) {
          // increment alert count
          redisClient.hincrby(countKey, key, 1, redisClient.print);
          
          // set timestamp
          var timestamp = (new Date()).getTime();
          redisClient.hset(timestampKey, key, timestamp, redisClient.print);

          if (!result) {
            // store message value in separate hash
            redisClient.hset(valueKey, key, message.value, redisClient.print);
          }
        });
      });
    });
  });

  wss.on('connection', function (ws) {
    // read new messages from redis buffer
    
    
    // ws.send(message.value, function () { });

    ws.on('close', function () {
      console.log('ws client disconnected');
    });

    ws.on('error', function (err) {
      console.log('WebSockets ERROR:');
      console.log(err);
    });
  });

  // Register realtime search
  app.post('/alerts', function (req, res) {
    res.send(null);
  });

  // Read realtime search
  app.get('/alerts', function (req, res) {
    res.render('alerts', { flash: req.flash() });
  });

};
