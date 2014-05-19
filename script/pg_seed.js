#!/usr/bin/env node

// Small script to seed postgres with fixtures

var Bookshelf = require('bookshelf')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../lib/config')[env]
  , users = require('../seed/pg/users')()
  , DB = Bookshelf.initialize({
    client: 'pg',
    connection: config.postgres
  });

var User = DB.Model.extend({
  tableName: 'users'
});

var Users = DB.Collection.extend({
  model: User
});

Users.forge(users).invoke('save', function (err) {
  console.log(err);
});




