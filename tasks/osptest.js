module.exports = function (grunt) {
  var config = require('../src/server/config/');
  grunt.registerTask('osptest', function () {
    config.kibana.opensoc.auth = true;
    grunt.task.run([
      'jshint:source',
      'jscs:source',
      'maybe_start_kibana',
      'simplemocha:opensoc'
    ]);
  });
};