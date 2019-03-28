const uWS = require('uWebSockets.js');
const BaseApp = require('./baseapp');
const { extend } = require('./utils');

class App extends uWS.App {
  constructor(options) {
    super(options);
    extend(this, BaseApp);
  }
}

module.exports = App;
