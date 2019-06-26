const { App } = require('@sifrr/server');

const server = new App();

server.get('/abcd404', res => {
  res.writeStatus('404 Not Found');
  res.end('Not Found');
});

server.get('/asdasdasd404', res => {
  res.writeStatus('404 Not Found');
  res.end('Not Found');
});

module.exports = server;
