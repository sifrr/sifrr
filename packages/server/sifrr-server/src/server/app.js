const uWS = require('uWebSockets.js');

class App extends uWS.App {
  constructor(options) {
    super(options);
  }
}

module.exports = App;
