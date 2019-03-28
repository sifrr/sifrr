const uWS = require('uWebSockets.js');
const BaseApp = require('./baseapp');
const { extend } = require('./utils');

class SSLApp extends uWS.SSLApp {
  constructor(options) {
    super(options);
    extend(this, BaseApp);
  }
}

module.exports = SSLApp;
