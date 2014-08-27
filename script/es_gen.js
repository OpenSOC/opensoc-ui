#!/usr/bin/env node

/*
 * es_gen.js
 * A small utility that generates json seed data for Elasticsearch
 *
 */


var _ = require('lodash');
var Chance = require('chance');
var fs = require('fs');

var chance = new Chance();
var documentsPerIndex = 1000;
var numEnrichedMachines = 100;
var numOtherMachines = 200;

var oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

var startTimestamp = oneMonthAgo.getTime();
var endTimestamp = startTimestamp + (90 * 24 * 60 * 60 * 1000);
var indices = [
  'bro',
  'fireeye',
  'lancope',
  'qosmos',
  'qradar',
  'sourcefire'
];


var inventory = [];
var assetValues = ['important', 'mundane'];
var assetTypes = ['printer', 'server', 'router'];
var clusters = ['preprod', 'cluster A', 'cluster B'];

function choice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
};

function randomAlert(index) {
  var dst = choice(inventory);
  var src = choice(inventory);

  return {
    enrichment: {
      geo: {
        ip_dst_addr: dst.geo,
        ip_src_addr: src.geo
      },
      host: {
        ip_dst_addr: dst.host,
        ip_src_addr: src.host
      },
      alert: {
        cluster: choice(clusters),
        source: index,
        priority: chance.integer({min: 1, max: 3})
      },
      message: {
        ip_dst_addr: dst.ip,
        ip_src_addr: src.ip,
        original_string: chance.paragraph(),
        timestamp: chance.integer({min: startTimestamp, max: endTimestamp})
      }
    }
  }
}

for (var i = 0; i < numEnrichedMachines; i++) {
  inventory.push({
    ip: chance.ip(),
    geo: {
      country: 'US',
      dmaCode: chance.integer({min: 500, max: 700}),
      city: chance.city(),
      postalCode: chance.zip(),
      latitude: chance.latitude({fixed: 4}),
      longitude: chance.longitude({fixed: 4}),
      locID: chance.integer({min: 10000, max: 30000})
    },
    host: {
      known_info: {
        asset_value: choice(assetValues),
        type: choice(assetTypes),
        local: choice(['YES', 'NO'])
      }
    }
  });
}

for (var i = 0; i < numOtherMachines; i++) {
  inventory.push({ip: chance.ip()});
}

for (var i = 0, index; index = indices[i]; i++) {
  var filename = index + '.json';
  var json = fs.createWriteStream('seed/es/' + filename);
  var objects = [];

  for (var j = 0; j < documentsPerIndex; j++) {
    objects.push(JSON.stringify({index: {_index: index, _type: index}}));
    objects.push(JSON.stringify(randomAlert(index)));
  }

  json.write(objects.join('\n'));
  json.close();
}
