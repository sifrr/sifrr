process.env.NODE_PATH = require('path').join(__dirname, './node_modules');
require('module').Module._initPaths();

let port = false;
const index = Math.max(process.argv.indexOf('--port'), process.argv.indexOf('-p'));
if (index !== -1) {
  port = +process.argv[index + 1];
}
global.ENV = port ? 'development' : 'test';

const Server = require('../../src/sifrr.server');

function webSocketServer(port) {
  const connections = {};
  let id = 0;

  const app = new Server();
  app.ws('/*', {
    /* Options */
    compression: Server.SHARED_COMPRESSOR,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 120,
    /* Handlers */
    open: (ws, req) => {
      // TODO: Add CORS policy
      connections[id] = ws;
      ws.id = id;
      ws.send(JSON.stringify({ connectionId: id }));
      global.console.log('A WebSocket connected via URL: ' + req.getUrl() + '! id: ', id);
      id++;
    },
    message: (ws, message) => {
      /* Ok is false if backpressure was built up, wait for drain */
      message = parseBuffer(message);
      let ok = ws.send(JSON.stringify(message));
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
      global.console.log(`WebSocket ${ws.id} closed: ${parseBuffer(message)}`);
    }
  }).get('/*', (res) => {
    res.writeHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
  }).post('/*', (res) => {
    res.writeHeader('Access-Control-Allow-Origin', '*');
    res.writeHeader('Content-Type', 'application/json');
    readData(res, (obj) => {
      res.end(JSON.stringify({ dataYouSent: JSON.parse(obj) }));
    });
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

function parseBuffer(buf) {
  let ret = Buffer.from(buf).toString('utf8');
  try {
    return JSON.parse(ret);
  } catch(e) {
    return ret;
  }
}

/* Helper function for reading a posted JSON body */
function readData(res, cb, err) {
  let buffer;
  /* Register data cb */
  res.onData((ab, isLast) => {
    let chunk = Buffer.from(ab);
    if (isLast) {
      if (buffer) {
        cb(Buffer.concat([buffer, chunk]));
      } else {
        cb(chunk);
      }
    } else {
      if (buffer) {
        buffer = Buffer.concat([buffer, chunk]);
      } else {
        buffer = Buffer.concat([chunk]);
      }
    }
  });

  /* Register error cb */
  res.onAborted(err);
}

if (port) {
  webSocketServer(port);
}

module.exports = webSocketServer;
