const { App } = require('../../../src/sifrr.server');
const path = require('path');

const app = new App({
  allowedOrigins: ['*'],
  allowedMethods: ['*']
});
app.file(path.join(__dirname, 'public'));

module.exports = app;
