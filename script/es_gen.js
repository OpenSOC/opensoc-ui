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
var sources = [
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
var alertType = ['error', 'warning', 'alert'];
var clusters = ['preprod', 'cluster A', 'cluster B'];
var cifLevels = ['orange', 'red', 'yellow', 'brown'];
var protocols = ['tcp', 'udp'];
var protocolMap = {tcp: 6, udp: 17};

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function ipToHex(ip) {
  var parts = ip.split('.');
  for (var i = 0; i < parts.length; i++) {
    parts[i] = parseInt(parts[i]).toString(16);
    if (parts[i].length == 1) {
      parts[i] = '0' + parts[i];
    }
  }
  return parts.join('');
}

function choice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAlerts(source, event) {
  var alerts = [];
  var instance = pad(chance.integer({min: 1, max: 3}), 3);
  var priorities = ['High', 'Medium', 'Low'];

  for(var i = 0; i < chance.integer({min: -5, max: 3}); i++) {
    var alertId = chance.guid();
    event.alerts.push(alertId);
    alerts.push({
      alert_id: alertId,
      timestamp: event.message.timestamp,
      priority: choice(priorities),
      designated_host: choice([
        event.message.ip_src_addr,
        event.message.ip_dst_addr
      ]),
      description: chance.sentence(),
      environment: {
        customer: 'mtd',
        instance: 'dev',
        datacenter: choice(clusters)
      },
      topology: {
        topology: source,
        topology_instance: source[0].toUpperCase() + instance
      },
      enrichment: event.enrichment
    });
  }
  return alerts;
}

function randomEvent(source) {
  var dst = choice(inventory);
  var src = choice(inventory);
  var protocol = choice(protocols);

  return {
    alerts: [],
    message: {
      ip_dst_addr: dst.ip,
      ip_src_addr: src.ip,
      ip_dst_port: chance.integer({min: 22, max: 65535}),
      ip_src_port: chance.integer({min: 22, max: 65535}),
      protocol: protocol,
      original_string: chance.paragraph(),
      timestamp: chance.integer({min: startTimestamp, max: endTimestamp})
    },
    enrichment: {
      cif: {
        level: choice(cifLevels)
      },
      geo: {
        ip_dst_addr: dst.geo,
        ip_src_addr: src.geo
      },
      host: {
        ip_dst_addr: dst.host,
        ip_src_addr: src.host
      }
    }
  };
}

function randomPcap(event, offset) {
    offset = offset || 0;
    return {
    ip_src_addr: event.message.ip_src_addr,
    ip_dst_addr: event.message.ip_dst_addr,
    ip_src_port: event.message.ip_src_port,
    ip_dst_port: event.message.ip_dst_port,
    protocol: protocolMap[event.message.protocol],
    message: {
      ts_micro: Math.floor(event.message.timestamp * 1000) + offset,
      ip_id: chance.integer({min: 0, max: 99999}),
      frag_offset: chance.integer({min: 0, max: 99999}),
      pcap_id: [
        ipToHex(event.message.ip_src_addr),
        ipToHex(event.message.ip_dst_addr),
        protocolMap[event.message.protocol],
        event.message.ip_src_port,
        event.message.ip_dst_port,
      ].join('-')
    }
  };
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
      locID: chance.integer({min: 10000, max: 30000}),
      location_point: chance.coordinates({fixed: 2}),
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

for (var i = 0; i < sources.length; i++) {
  var source = sources[i];
  var filename = source + '.json';
  var json = fs.createWriteStream('seed/es/' + filename);
  var objects = [];

  for (var j = 0; j < documentsPerIndex; j++) {
    var index = source + '_index';
    var type = source + '_doc';

    var eventData = randomEvent(source);
    var alertData = randomAlerts(source, eventData);
    for (var k = 0; k < alertData.length; k++) {
      eventData.alerts.push(alertData[k].alert_id);
    }

    objects.push(JSON.stringify({index: {_index: index, _type: type}}));
    objects.push(JSON.stringify(eventData));

    objects.push(JSON.stringify({index: {_index: 'alert', _type: source + '_alert'}}));
    for (var k = 0; k < alertData.length; k++) {
      objects.push(JSON.stringify(alertData[k]));
    }

    for (var l = 0; l < chance.integer({min: 1, max: 50}); l++) {
      objects.push(JSON.stringify({index: {_index: 'pcap_all', _type: 'pcap_doc'}}));
      objects.push(JSON.stringify(randomPcap(eventData, l * 1000)));
    }
  }

  json.write(objects.join('\n'));
  json.close();
}
