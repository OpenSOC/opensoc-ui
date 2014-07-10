'use strict';

var dashboard, queries

// All url parameters are available via the ARGS object
var ARGS;

// Intialize a skeleton with nothing but a rows array and service object
dashboard = {
  rows : [],
  services : {}
};

dashboard.title = 'PCAP table';
dashboard.failover = false;
dashboard.index = {
  default: 'mymusic', //ARGS.index||'ADD_A_TIME_FILTER',
  interval: 'none'
};

queries = {
  0: {
    query: '*',
    id: 0,
  }
};

// Now populate the query service with our objects
dashboard.services.query = {
  list : queries,
  ids : _.map(_.keys(queries),function(v){return parseInt(v,10);})
};

dashboard.rows = [
  {
    title: "Table",
    height: "300px"
  }
];

dashboard.rows[0].panels = [
  {
    title: 'PCAP data',
    type: 'table',
    time_field: ARGS.timefield||"@timestamp",
    auto_int: true,
    span: 12
  }
];

return dashboard;