#!/usr/bin/env node

var http = require('http')
  , fs = require('fs')
  , glob = require('glob')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../lib/config')[env];

var options = {
  hostname: config.elasticsearch.host,
  port: config.elasticsearch.port,
  method: 'POST'
};

// file is a string pointing to json file
var open_file = function (file) {
  var opts = { encoding: 'utf-8', flag: 'r' };

  fs.readFile(file, opts, function (err, data) {
    if (err) {
      throw err;
    }
    var index_name = file.replace('data/', '').replace('.json', '');

    options.path = '/' + index_name + '/' + index_name;
    var req = http.request(options, function (res) {
      var data = [];

      res.setEncoding('utf-8');
      res.on('data', function (chunk) {
        data.push(chunk);
      });

      res.on('end', function () {
        console.log(data.join(''));
      });
    });

    req.on('error', function (e) {
      console.log('problem with request: ' + e.message);
    });

    // write file data
    req.write(data);
    req.end();
  });
};

var each_file = function (err, files) {
  if (err) {
    throw err;
  }

  files.forEach(open_file);
};

glob('data/*.json', null, each_file);
