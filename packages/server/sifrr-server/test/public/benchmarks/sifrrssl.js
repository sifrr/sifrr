const { SSLApp } = require('../../../src/sifrr.server');
const path = require('path');

const app = new SSLApp({
  key_file_name: path.join(__dirname, 'keys/server.key'),
  cert_file_name: path.join(__dirname, 'keys/server.crt')
});

app.folder('/', path.join(__dirname, 'public'), {
  headers: {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': '*'
  },
  compress: false
});

module.exports = app;
