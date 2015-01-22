function readRawBytes(size, transit) {
  var buffer = new Buffer(size);
  var bytesRead = 0;
  var bytesLeft, dataLeft, len, leftOver;
  var data, offset;

  while (bytesRead < size) {
    if (!data || offset >= data.length) {
      offset = 0;
      data = transit.shift();
    }

    bytesLeft = size - bytesRead;
    dataLeft = data.length - offset;
    len = bytesLeft < dataLeft  ? bytesLeft : dataLeft;
    data.copy(buffer, bytesRead, offset, offset + len);
    bytesRead += len;
    offset += len;
  }

  if (offset < data.length) {
    dataLeft = data.length - offset;
    leftOver = new Buffer(dataLeft);
    data.copy(leftOver, 0, offset, offset + dataLeft);
    transit.unshift(leftOver);
  }

  return buffer;
}


exports = module.exports = function(app, config) {
  var _ = require('lodash');
  var fs = require('fs');
  var spawn = require('child_process').spawn;
  var querystring = require('querystring');
  var XmlStream = require('xml-stream');

  // Mock pcap service for use in development
  if (config.pcap.mock) {
    app.get('/sample/pcap/:command', function(req, res) {
      res.sendFile('/vagrant/seed/opensoc.pcap');
    });
  }

  app.get('/pcap/:command', function(req, res) {
    if (config.auth && (!req.user || !req.user.permissions.pcap)) {
      res.send(403, 'Forbidden!');
      return;
    }

    var transit = [];
    var raw = req.query.raw;
    var pcapUrl = config.pcap.url + '/' + req.param('command');
    var params = _.defaults({}, req.query);
    delete params[raw];
    pcapUrl += '?' + querystring.stringify(params);

    var curl = spawn('curl', ['-s', pcapUrl]);

    if (raw) {
      res.set('Content-Type', 'application/cap');
      res.set('Content-Disposition', 'attachment; filename="opensoc.pcap"')
      curl.stdout.pipe(res);
      return;
    }

    res.set('Content-Encoding', 'gzip');
    res.set('Content-Type', 'text/event-stream');

    var gzip = spawn('gzip');
    var tshark = spawn('tshark', ['-l', '-i', '-', '-T', 'pdml']);
    var xml = new XmlStream(tshark.stdout);

    xml.collect('proto');
    xml.collect('field');

    gzip.stdout.pipe(res);
    curl.stdout.pipe(tshark.stdin);
    curl.stdout.on('data', function (data) {
      transit.push(data);
    });

    gzip.stdout.on('end', function() {
      gzip.stdout.unpipe(res.stdin);
      gzip.kill('SIGKILL');
    });

    var npcaps = 0;
    xml.on('end', function() {
      gzip.stdin.end();
      curl.stdout.unpipe(tshark.stdin);
      curl.kill('SIGKILL');
      tshark.kill('SIGKILL');
    });

    xml.on('endElement: packet', function(packet) {
      var psize = parseInt(packet.proto[0].$.size);
      npcaps || readRawBytes(24, transit);  // skip global header
      readRawBytes(16, transit);  // skip packet header
      packet.hexdump = readRawBytes(psize, transit).toString('hex');
      gzip.stdin.write('data: ' + JSON.stringify(packet) + '\n\n');
      npcaps++;
    });
  });
};
