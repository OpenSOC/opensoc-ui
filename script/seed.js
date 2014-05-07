#!/usr/bin/env node

var http = require('http')
  , fs = require('fs')
  , _ = require('lodash');

var options = {
  host: 'elasticsearch-stag.mtd.cisco-services.com',
  port: 9200
};

// indices to pull test data from
var indices = [
  'sourcefire',
  'qosmos',
  'qradar',
  'fireeye',
  'bro-201405050800'
];

var retrieve = function (el, i) {
  options.path = '/' + el + '/_search?size=1000&fields=_source';

  http.get(options, function (response) {
    var data = [];

    response.on('data', function (chunk) {
      data.push(chunk);
    });

    response.on('end', function () {
      var filePath = 'data/' + el + '.json'
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
