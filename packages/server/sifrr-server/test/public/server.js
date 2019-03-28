process.env.NODE_PATH = require('path').join(__dirname, './node_modules');
require('module').Module._initPaths();

let port = false;
const index = Math.max(process.argv.indexOf('--port'), process.argv.indexOf('-p'));
if (index !== -1) {
  port = +process.argv[index + 1];
}
global.ENV = port ? 'development' : 'test';

const path = require('path');
// const { App } = require('uWebSockets.js');

function webSocketServer(port) {
  let id = 0;
  const app = require('./benchmarks/sifrr');
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
    .post('/what', (res) => {
      res.onAborted(err => { if (err) throw Error(err); });

      res.writeHeader('content-type', 'application/json');
      if (typeof res.formData === 'function') {
        res.formData({
          // required else promise will not resolve
          onFile: (fieldname, file) => {
            file.resume();
          }
        }).then(resp => {
          res.end(JSON.stringify(resp));
        });
      } else if (typeof res.json === 'function') {
        res.json().then(resp => res.end(JSON.stringify(resp)));
      } else {
        res.end(JSON.stringify({ ok: false }));
      }
    })
    .folder('/', path.join(__dirname, '../../../../browser/sifrr-fetch/dist'))
    .folder('/', path.join(__dirname, '../../../../browser/sifrr-dom/dist'))
    .file('/video', '/Users/aaditya-taparia/Downloads/example.mp4')
    .folder('/', __dirname, {
      filter: (path) => path.indexOf('node_modules') < 0 && path.indexOf('benchmarks') < 0,
      watch: true
    })
    .get('/ok/now', (res) => {
      res.end('ok');
    }).get('/not/file', (res) => {
      res.writeHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: true }));
    })
    .file('/static/*', path.join(__dirname, './static.html'))
    .listen(port, (socket) => {
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
