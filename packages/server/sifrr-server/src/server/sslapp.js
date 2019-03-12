const uWS = require('uWebSockets.js');

class SSLApp extends uWS.SSLApp {
  constructor(options) {
    super(options);
  }
}

module.exports = SSLApp;
