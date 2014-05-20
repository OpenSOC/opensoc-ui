var config = require('../../database')[process.env.NODE_ENV || 'dev']
  , Bookshelf = require('bookshelf');

Bookshelf.PG = Bookshelf.PG || Bookshelf.initialize({
  client: 'pg',
  connection: config
});


module.exports = Bookshelf.PG;
