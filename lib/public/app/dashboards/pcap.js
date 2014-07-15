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
  default: '_index', //ARGS.index||'ADD_A_TIME_FILTER',
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

  dashboard.services.filter = {
  list: {
   0:{
      "type": "terms",
      "field": "severity",
      "value": ARGS.severity,
      "mandate": "must",
      "active": !_.isUndefined(ARGS.severity),
      "alias": "",
      "id": 0
    },
    1:{
      "type": "terms",
      "field": "severity_label",
      "value": ARGS.severity_label,
      "mandate": "must",
      "active": !_.isUndefined(ARGS.severity_label),
      "alias": "",
      "id": 1
    }
 
  },
  ids: [0,1]
};

       /*
       function print_packet_row ()
          Number
          Time
          Source
          Destination
          Protocol
          Length
          Info


       */

       // here for reference while building the parser of the JSON PCAP data
       function print_packet_row ( packet_index ) {
         var pcap_count = 0;

         console.log(jsonObject.pdml.packet[packet_index].proto[0].field[0].$.name);

         console.log(jsonObject.pdml.packet[packet_index].proto[0].field[0].$.name==="num");

         var first_packet = jsonObject.pdml.packet[0];

         var current_proto = jsonObject.pdml.packet[0].proto[0];

         // temporary row to be injected via the DOM... changing this to be an array
         //   to be used in the pcap dashboard JSON
         var temp_string = '<tr><td class="num"></td><td class="time"></td><td class="source"></td><td class="destination"></td><td class="protocols"></td><td class="length"></td><td class="info"></td></tr>';

         var protos_length = first_packet.proto.length;
         var current_proto_fields_length = current_proto.field.length;

         for (i = 0;  i < protos_length; ++i) {

          console.log ('protos_length = ', protos_length, ', i = ', i);

          current_protos_length = jsonObject.pdml.packet[packet_index].proto[i].field.length

           for (j = 0; j < current_protos_length; ++j) {

            console.log ('current_protos_length = ', current_protos_length, ', j = ', j, '\njsonObject.pdml.packet[packet_index].proto[i].field[j].$.show = ', jsonObject.pdml.packet[packet_index].proto[i].field[j].$.show, '\nname: ', jsonObject.pdml.packet[packet_index].proto[i].field[j].$.name);

             switch ( jsonObject.pdml.packet[packet_index].proto[i].field[j].$.name ) {
                      case 'num':
                        // soon to be organized into an array to be placed in the dashboard
                        // currently swapping out the table cells via the DOM
                        temp_string = temp_string.replace('<td class="num">', '<td class="num">'+jsonObject.pdml.packet[packet_index].proto[i].field[j].$.show);
                        break;

                      case 'len':
                        // soon to be organized into an array to be placed in the dashboard
                        // currently swapping out the table cells via the DOM
                        temp_string = temp_string.replace('<td class="length">', '<td class="length">'+jsonObject.pdml.packet[packet_index].proto[i].field[j].$.show);
                        break;

                      case 'timestamp':
                        // soon to be organized into an array to be placed in the dashboard
                        // currently swapping out the table cells via the DOM
                        temp_string = temp_string.replace('<td class="time">', '<td class="time">'+jsonObject.pdml.packet[packet_index].proto[i].field[j].$.show);
                        break;

                      case 'eth.src':
                        // soon to be organized into an array to be placed in the dashboard
                        // currently swapping out the table cells via the DOM
                        temp_string = temp_string.replace('<td class="source">', '<td class="source">'+jsonObject.pdml.packet[packet_index].proto[i].field[j].$.show);
                        break;

                      case 'eth.dst':
                        // soon to be organized into an array to be placed in the dashboard
                        // currently swapping out the table cells via the DOM
                        temp_string = temp_string.replace('<td class="destination">', '<td class="destination">'+jsonObject.pdml.packet[packet_index].proto[i].field[j].$.show);
                        break;

                      case 'frame.protocols':
                        // soon to be organized into an array to be placed in the dashboard
                        // currently swapping out the table cells via the DOM
                        temp_string = temp_string.replace('<td class="protocols">', '<td class="protocols">'+jsonObject.pdml.packet[packet_index].proto[i].field[j].$.show);
                        break;
              }

            }

          }

         console.log(temp_string);
         console.log('current_proto.field.length = ', current_proto.field.length);

         $('table').append(temp_string);
       }

       $.each( jsonObject.pdml.packet, function ( index ) {
        print_packet_row( index );
       });
      

       //console.log('jsonObject.pdml.packet.length = ', jsonObject.pdml.packet.length);


return dashboard;