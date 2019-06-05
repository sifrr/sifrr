const { App } = require('@sifrr/server');

const server = new App();

server.get('/404', res => {
  res.writeStatus('404 Not Found');
  res.end();
});

module.exports = server;
