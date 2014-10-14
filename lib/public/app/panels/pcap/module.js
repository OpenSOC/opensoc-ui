/** @scratch /panels/5
 *
 * include::panels/pcap.asciidoc[]
 */

/** @scratch /panels/pcap/0
 * == pcap
 * Status: *Stable*
 *
 * The pcap panel is used for displaying static pcap formated as markdown, sanitized html or as plain
 * pcap.
 *
 */

define([
  'angular',
  'app',
  'lodash',
  'require',
  'jquery',
  'kbn'
],
function (angular, app, _, require, kbn) {
  'use strict';

  var module = angular.module('kibana.panels.pcap', []);
  app.useModule(module);

  module.controller('pcap', function($filter, $scope, $http) {
    $scope.user = window.user;

$scope.panelMeta = {
      modals : [
        {
          description: "Inspect",
          icon: "icon-info-sign",
          partial: "app/partials/inspector.html",
          show: $scope.panel.spyable
        }
      ],
      status  : 'Stable',
      description : 'OpenSoc PCAP viewer'
    };

    $scope.durations = [
      {desc: '1d', sec: 24 * 60 * 60},
      {desc: '6h', sec: 6 * 60 * 60},
      {desc: '1h', sec: 60 * 60},
      {desc: '30m', sec: 30 * 60},
      {desc: '15m', sec: 15 * 60},
      {desc: '5m', sec: 5 * 60},
      {desc: '1m', sec: 60},
      {desc: '30s', sec: 10},
      {desc: '10s', sec: 10},
      {desc: '5s', sec: 5},
      {desc: '1s', sec: 1}
    ];

    $scope.streamPage = 0;
    $scope.duration = $scope.durations[$scope.durations.length - 1];

    function serialize(obj) {
      var str = [];
      for(var p in obj)
        if (obj.hasOwnProperty(p)) {
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
      return str.join("&");
    }

    function makeFilter() {
      var fields = [
        'ip_src_addr', 'ip_dst_addr',
        'ip_src_port', 'ip_dst_port',
        'ip_protocol'
      ];

      var filter;
      $.each(fields, function(i, f) {
        if ($scope[f]) {
          filter = (filter || ejs.BoolFilter()).must(ejs.TermFilter(f, $scope[f]))
        }
      });

      if($scope.ts) {
        var ts = Date.parse($scope.ts);
        ts = ts > 0 ? ts : parseInt($scope.ts);
        if (ts <= 999999999999) {
          ts *= 1000;
        }

        filter = (filter || ejs.BoolFilter())
          .must(ejs.RangeFilter('ts_micro')
            .gte((ts - $scope.duration.sec * 1000) * 1000)
            .lte((ts + $scope.duration.sec * 1000) * 1000))
      }
      return filter;
    }

    function makePcapQuery(keys) {
      var params = {
        keys: keys,
        includeReverseTraffic: $scope.includeReverseTraffic || false,
      };

      if ($scope.ts) {
        var ts = Date.parse($scope.ts);
        ts = ts > 0 ? ts : parseInt($scope.ts);
        if (ts <= 9999999999999) {
          ts *= 1000;
        }

        $.extend(params, {
          startTime: ts - $scope.duration.sec * 1000,
          endTime: ts + $scope.duration.sec + 1000
        });
      }
      return params;
    }

    $scope.setStream = function(idx, pcapId, page) {
      $scope.stream = null;
      $scope.selectedStream = idx;
      $scope.selectedPacket = null;
      $scope.packetData = [];
      $scope.packet = null;
      $scope.streamPage = page;

      var filter = makeFilter() || ejs.BoolFilter();
      filter.must(ejs.TermFilter('pcap_id', pcapId));

      var size = 500;
      $scope.streamFrom = (page || 0) * size;
      var request = ejs.Request()
        .indices('pcap_all')
        .types('pcap_doc')
        .filter(filter)
        .from($scope.streamFrom)
        .size(size);

      $scope.inspector = angular.toJson(JSON.parse(request.toString()),true);
      request.doSearch(function(stream) {
        $scope.stream = stream;
      });
    };

    $scope.downloadStream = function(doc) {
      var response = true;
      if (doc.count > 500) {
        var message = [
          'Are you sure you want to download', doc.count, 'packets?'
        ].join(' ');
        response = window.confirm(message);
      }

      if (response) {
        var params = makePcapQuery(doc.term);
        params.raw = true;
        window.location = '/pcap/getPcapsByKeys?' + serialize(params);
      }
    };

    $scope.setPacket = function(idx, message) {
      $scope.selectedPacket = idx;
      $scope.packetData = [];
      $scope.packet = null;
      var params = makePcapQuery([
        message.pcap_id, message.ip_id, message.frag_offset
      ].join('-'));

      $scope.evtSource && $scope.evtSource.close();
      $scope.evtSource = new EventSource('/pcap/getPcapsByKeys?' + serialize(params));

      $scope.evtSource.onmessage = function(e) {
        $scope.packetData.push(JSON.parse(e.data));
        $scope.$apply();
      };

      $scope.evtSource.onerror = function () {
        $scope.evtSource.close();
        $scope.evtSource = null;
      };
    };

    $scope.setPcapPacket = function(p) {
      $scope.packet = p;
    };

    $scope.parsePcapId = function(pcapId) {
      var identifiers = pcapId.split('-');
      return {
        src_ip: $filter('hexToIp')(identifiers[0]),
        dst_ip: $filter('hexToIp')(identifiers[1]),
        protocol: parseInt(identifiers[2], 10),
        src_port: parseInt(identifiers[3], 10),
        dst_port: parseInt(identifiers[4], 10)
      };
    };

    $scope.search = function() {
      $scope.selectedStream = null;
      $scope.selectedPacket = null;
      $scope.packetData = null;
      $scope.packet = null;
      $scope.results = null;
      $scope.stream = null;
      $scope.streamPage = 0;
      $scope.streamFrom = 0;

      var filter = makeFilter();
      var facet = ejs.TermsFacet('packets').field('pcap_id');

      if (filter) {
        facet = facet.facetFilter(filter)
      }

      var size = 100;
      var request = ejs.Request()
        .indices('pcap_all')
        .types('pcap_doc')
        .facet(facet.size(size))

      $scope.inspector = angular.toJson(JSON.parse(request.toString()),true);
      request.doSearch(function(results) {
        $scope.results = results;
      });
    };
  });

  // From: http://stackoverflow.com/questions/14430655/recursion-in-angular-directives
  module.factory('RecursionHelper', ['$compile', function($compile) {
    /* The MIT License (MIT)

    Copyright (c) 2014 Mark Lagendijk

    Permission is hereby granted, free of charge, to any person obtaining a copy of
    this software and associated documentation files (the "Software"), to deal in
    the Software without restriction, including without limitation the rights to
    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
    the Software, and to permit persons to whom the Software is furnished to do so,
    subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
    FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
    COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
    IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
    CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

    This license only applies to this angular factory.
    */

    return {
      /**
       * Manually compiles the element, fixing the recursion loop.
       * @param element
       * @param [link] A post-link function, or an object with function(s) registered via pre and post properties.
       * @returns An object containing the linking functions.
       */
      compile: function(element, link) {
        // Normalize the link parameter
        if(angular.isFunction(link)){
          link = { post: link };
        }

        // Break the recursion loop by removing the contents
        var contents = element.contents().remove();
        var compiledContents;
        return {
          pre: (link && link.pre) ? link.pre : null,
          /**
           * Compiles and re-adds the contents
           */
          post: function(scope, element){
            // Compile the contents
            if(!compiledContents){
              compiledContents = $compile(contents);
            }
            // Re-add the compiled contents to the element
            compiledContents(scope, function(clone) {
              element.append(clone);
            });

            // Call the post-linking function, if any
            if(link && link.post){
              link.post.apply(null, arguments);
            }
          }
        };
      }
    };
  }]);

  module.directive('packet', function() {
    return {
      templateUrl: 'packet.html',
      scope: {
        packet: '='
      },
      controller: function($scope) {
        return {
          toggle: function(proto, value) {
            proto.expanded = value;
            if (proto.parent) {
              this.toggle(proto.parent.$, value);
            }
          },
          select: function(proto) {
            if ($scope.selected == proto.$) {
              $scope.selected.expanded = !$scope.selected.expanded;
              return;
            }

            $scope.selected && this.toggle($scope.selected, false);
            this.toggle(proto.$, true);
            $scope.selected = proto.$;
          },
          uid: function(obj) {
            return [
              String(obj.showname),
              (Math.random() + 1).toString(36).substring(7)
            ].join('_');
          },
          buildHighlightMap: function(proto) {
            var self = this;
            $.each(proto.field || [], function(i, field) {
              self.processField(proto, field);
            });
          },
          processField: function(proto, field) {
            var start = parseInt(field.$.pos);
            var end = start + parseInt(field.$.size) - 1;
            field.$.uid = this.uid(field.$);
            field.$.parent = proto;

            if (proto.$.name == 'geninfo') {
              field.$.showname += ': ' + field.$.value;
              return;
            }

            if (end >= start) {
              this.highlightMap.push({
                $: field.$,
                uid: field.$.uid,
                start: start,
                end: end
              });

              field.field && this.buildHighlightMap(field);
            }
          }
        };
      },
      link: function(scope, elm, attr, controller) {
        scope.$watch('packet', function(value, oldValue) {
          console.log(value);
          controller.highlightMap = [];
          scope.selected = {};
          if (value) {
            $.each(value.proto, function(i, proto) {
              proto.$.uid = controller.uid(proto.$);
              controller.buildHighlightMap(proto);
            });
          }
        });
      }
    };
  });

  module.directive('proto', function(RecursionHelper) {
    return {
      templateUrl: 'proto.html',
      scope: {
        proto: '=',
        selected: '=',
        padding: '='
      },
      require: '^packet',
      compile: function(element) {
        return RecursionHelper.compile(element, function(scope, elm, attr, packet) {

          scope.select = $.proxy(packet.select, packet);
          scope.$watch('padding', function(value) {
            scope.nextPadding = parseInt(value || '0') + 30;
          })

        });
      }
    };
  });

  module.directive('hexBytes', function() {
    return {
      templateUrl: 'hexBytes.html',
      require: '^packet',
      scope: {
        selected: '=',
        dump: '='
      },
      link: function(scope, elm, attr, packet) {
        scope.$watch('dump', function(value, oldValue) {
          scope.bytes = [];
          for (var b = 0; b < scope.dump.length; b += 2) {
            scope.bytes.push(scope.dump.slice(b, b + 2));
          }
        });

        scope.selectByte = function(offset) {
          var selected = $.grep(packet.highlightMap, function(obj) {
            return obj.start <= offset && obj.end >= offset;
          })[0];

          selected && packet.select(selected);
        };
      }
    };
  });

  module.filter('sourcePort', function() {
    return function(sourcePort) {
      if (sourcePort) {
        var parts = sourcePort.split(': ');
        return parts[parts.length - 1];
      }
    }
  });

  module.filter('hexToIp', function() {
    return function(hex) {
      var parts = [];
      for (var p = 0; p < 4; p++) {
        var hexPart = hex.slice(p * 2, p * 2 + 2)
        parts.push(parseInt(hexPart, 16));
      }
      return parts.join('.');
    }
  });

  module.filter('num', function() {
    return function(input) {
      return parseInt(input, 10);
    }
  });

  module.filter('toAscii', function() {
    return function (text) {
      var code = parseInt(text, 16);
      var c = code <= 32 || code > 127 ? '.' : String.fromCharCode(code);
      return c + ' ';
    };
  });
});
