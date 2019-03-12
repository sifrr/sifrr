/*! Sifrr.Server v0.0.3 - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */
import uWebSockets from 'uWebSockets.js';

class App extends uWebSockets.App {
  constructor(options) {
    super(options);
  }
}
var app = App;

class SSLApp extends uWebSockets.SSLApp {
  constructor(options) {
    super(options);
  }
}
var sslapp = SSLApp;

var sifrr_server = {
  App: app,
  SSLApp: sslapp
};
var sifrr_server_1 = sifrr_server.App;
var sifrr_server_2 = sifrr_server.SSLApp;

export default sifrr_server;
export { sifrr_server_1 as App, sifrr_server_2 as SSLApp };
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.server.module.js.map
