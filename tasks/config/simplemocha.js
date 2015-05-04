module.exports = {
  options: {
    timeout: 2000,
    ignoreLeaks: false,
    reporter: 'dot'
  },
  opensoc: { src: ['<%= root %>/test/opensoc/**/*.js'] },
  all: { src: ['<%= root %>/test/unit/{server,tasks}/**/*.js'] }
};
