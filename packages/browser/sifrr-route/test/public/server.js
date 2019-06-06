const path = require('path');
const { App } = require('@sifrr/server');

const server = new App();

['/', '/index.html', '/abcd', '/target'].forEach(u => {
  server.file(u, path.join(__dirname, 'index.html'));
});

module.exports = server;
