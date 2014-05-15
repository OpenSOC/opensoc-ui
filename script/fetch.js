#!/usr/bin/env node

var http = require('http')
  , fs = require('fs')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../lib/config')[env]
  , _ = require('lodash');

var options = {
  host: config.elasticsearch.host,
  port: config.elasticsearch.port
};

var size = 1000;
var fields = [ '_source' ];

// indices to pull test data from
var indices = [
  'sourcefire',
  'qosmos',
  'qradar',
  'fireeye',
  'bro-201405050800'
];

var retrieve = function (index, i) {
  options.path =
    '/' + index + '/_search?size=' + size + '&fields=' + fields.join(',');

  http.get(options, function (response) {
    var data = [];

    response.on('data', function (chunk) {
      data.push(chunk);
    });

    response.on('end', function () {
      var filePath = 'data/' + index + '.json'
        , results = _.pluck(JSON.parse(data.join('')).hits.hits, '_source');

      var output = results.map(function (v) {
        return JSON.stringify(v);
      });

      fs.writeFile(filePath, output.join("\n"), function (err) {
        if (err) {
          throw err;
        }
      });
    });
  });
};

indices.forEach(retrieve);
