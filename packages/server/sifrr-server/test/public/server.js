process.env.NODE_PATH = require('path').join(__dirname, './node_modules');
require('module').Module._initPaths();

let port = false;
const index = Math.max(process.argv.indexOf('--port'), process.argv.indexOf('-p'));
if (index !== -1) {
  port = +process.argv[index + 1];
}
global.ENV = port ? 'development' : 'test';

const path = require('path');
const { App } = require('../../src/sifrr.server');
// const { App } = require('uWebSockets.js');

function webSocketServer(port) {
  let id = 0;
  const app = new App();
  app.ws('/*', {
    /* Options */
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 120,
    /* Handlers */
    open: (ws, req) => {
      ws.id = id;
      ws.send(JSON.stringify({ connectionId: id }));
      global.console.log('A WebSocket connected via URL: ' + req.getUrl() + '! id: ', id);
      id++;
    },
    message: (ws, message) => {
      /* Ok is false if backpressure was built up, wait for drain */
      let ok = ws.send(message);
      if (!ok) {
        if (ENV == 'development') global.console.log(`Message sending to websocket ${ws.id} failed:`, message);
      } else {
        if (ENV == 'development') global.console.log(`Message sent to websocket ${ws.id}:`, message);
      }
    },
    drain: (ws) => {
      global.console.log('WebSocket backpressure: ' + ws.getBufferedAmount());
    },
    close: (ws, code, message) => {
      global.console.log(`WebSocket ${ws.id} closed: ${message}`);
    }
  })
    .file(path.join(__dirname, '../../../../browser/sifrr-fetch/dist'))
    .file(path.join(__dirname, '../../../../browser/sifrr-dom/dist'))
    .file(__dirname)
    .get('/ok/now', (res) => {
      res.end('ok');
    }).get('/not/file', (res) => {
      res.writeHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: true }));
    }).listen(port, (socket) => {
      if (socket) {
        app.socket = socket;
        global.console.log('Listening to port ' + port);
      } else {
        global.console.log('Failed to listen to port ' + port);
      }
    });

  return app;
}

if (port) {
  webSocketServer(port);
}

module.exports = webSocketServer;
