var spawn = require('child_process').spawn
  , xml2js = require('xml2js')
  , sax = require('sax')
  , saxpath = require('saxpath')
  , WebSocketServer = require('ws').Server;

exports.stream = function (url, cb) {
  var saxParser = sax.createStream(true)
    , streamer = new saxpath.SaXPath(saxParser, '/pdml/packet')
    , parser = new xml2js.Parser()
    , curl = spawn('curl', ['-s', url])
    , tshark = spawn('tshark', ['-i', '-', '-T', 'pdml']);

  // connect pipes
  curl.stdout.pipe(tshark.stdin);
  tshark.stdout.pipe(saxParser);

  streamer.on('match', function (xml) {
    parser.parseString(xml, function (err, result) {
      if (err) {
        console.log('problem with xml chunk:');
        console.log(xml);
        throw err;
      } else {
        cb(result);
      }
    });
  });

  return { curl: curl, tshark: tshark, saxParser: saxParser };
};

exports.initialize = function (app, server) {

  // reset all sax entities
  for (var entity in sax.ENTITIES) {
    sax.ENTITIES[entity] = '&' + entity + ';';
  }

  // web socket setup
  var wss = new WebSocketServer({
    server: server,
    clientTracking: true,
    path: '/pcap'
  });

  // client connection
  wss.on('connection', function (ws) {
    var procs = exports.stream('192.168.33.10/napenthes.pcap', function (packet) {
      ws.send(JSON.stringify(packet), function () {});
    });

    ws.on('close', function () {
      // close streams
      procs.tshark.stdout.unpipe(procs.saxParser);
      procs.curl.stdout.unpipe(procs.tshark.stdin);

      procs.curl.kill('SIGKILL');
      procs.tshark.kill('SIGKILL');
    });
  });
};
