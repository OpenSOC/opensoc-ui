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
  'require'
],
function (angular, app, _, require) {
  'use strict';

  var module = angular.module('kibana.panels.pcap', []);
  app.useModule(module);

  module.controller('pcap', function($scope) {
    $scope.panelMeta = {
      status  : "Stable",
      description : "A static pcap panel that can use plain pcap, markdown, or (sanitized) HTML"
    };

    // Set and populate defaults
    var _d = {
      /** @scratch /panels/pcap/5
       *
       * === Parameters
       *
       * mode:: `html', `markdown' or `pcap'
       */
      mode    : "markdown", // 'html','markdown','pcap'
      /** @scratch /panels/pcap/5
       * content:: The content of your panel, written in the mark up specified in +mode+
       */
      content : "",
      style: {},
    };
    _.defaults($scope.panel,_d);

    $scope.init = function() {
      $scope.ready = false;
      
      $scope.get_data();
    };


    // Get HBase PCAP data
    $scope.get_data = function() {
      var responsePromise = $http.get('http://jsonspitter.apiary.io/things');

      responsePromise.success(function(data, status, headers, config) {
        $scope.data = _.map(data.pdml.packet[0].proto, function(result) {
          var _h = _.clone(result);
          return _h;
        });

        // $scope.hexData = data.pdml.packet[0].proto[5].hexPacket;

        console.log($scope.data);

      });

      responsePromise.error(function(data, status, headers, config) {
        console.log('AJAX Failed');
      });
    };




  });

  module.directive('markdown', function() {
    return {
      restrict: 'E',
      link: function(scope, element) {
        scope.$on('render', function() {
          render_panel();
        });

        function render_panel() {
          require(['./lib/showdown'], function (Showdown) {
            scope.ready = true;
            var converter = new Showdown.converter();
            var pcap = scope.panel.content.replace(/&/g, '&amp;')
              .replace(/>/g, '&gt;')
              .replace(/</g, '&lt;');
            var htmlText = converter.makeHtml(pcap);
            element.html(htmlText);
            // For whatever reason, this fixes chrome. I don't like it, I think
            // it makes things slow?
            if(!scope.$$phase) {
              scope.$apply();
            }
          });
        }

        render_panel();
      }
    };
  });

  module.filter('newlines', function(){
    return function (input) {
      return input.replace(/\n/g, '<br/>');
    };
  });

  module.filter('striphtml', function () {
    return function(pcap) {
      return pcap
        .replace(/&/g, '&amp;')
        .replace(/>/g, '&gt;')
        .replace(/</g, '&lt;');
    };
  });
});
