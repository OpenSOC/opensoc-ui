var kafkaesque = require('kafkaesque')({
  brokers: [{ host: '192.168.10.33', port: 9092 }],
  clientId: 'ui',
  maxBytes: 2000000
});

exports.read = function (opts) {
  if (!opts || typeof opts.success !== 'function') {
    throw "Must pass success callback";
  }

  kafkaesque.tearUp(function () {
    kafkaesque.poll({ topic: 'opensoc', partition: 0 }, function (err, kafka) {
      kafka.on('message', function (message, commit) {
        opts.success(message);

        // once a message has been successfull handled, call commit to advance
        // this consumers position in the topic / parition 
        commit();
      });

      kafka.on('error', function (error) {
        if (typeof opts.error === 'function') {
          opts.error(error);
        } else {
          throw JSON.stringify(error);
        }
      });
    });
  });
};
