const uWS = require('uWebSockets.js');
const BaseApp = require('./baseapp');

class App extends BaseApp {
  constructor(options) {
    super();
    this._app = uWS.App(options);
  }
}

module.exports = App;
