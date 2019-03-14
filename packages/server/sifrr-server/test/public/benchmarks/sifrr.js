const { App } = require('../../../src/sifrr.server');
const path = require('path');

const app = new App();
app.file('/', path.join(__dirname, 'public'), {
  headers: {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': '*'
  }
});

module.exports = app;
