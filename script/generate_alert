#!/usr/bin/env node

// Script to generate sample alerts

var kafka = require('../lib/modules/kafka')
  , Chance = require('chance')
  , chance = new Chance()

  // Number of randomly-generated messages per second
  , mps = 1
  , topic = 'opensoc';


// Fire off random text
setInterval(function () {
  var message = chance.paragraph();
  kafka.produce(topic, message, function (err, result) {
    console.log('Sending Text:');
    console.log(message);
    console.log();
    console.log('Reply from kafka server:');
    console.log(result);
    console.log();
    console.log();
  });
}, 1000 / mps);
