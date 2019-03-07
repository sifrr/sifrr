process.env.NODE_PATH = require('path').join(__dirname, './node_modules');
require('module').Module._initPaths();
require('./config/setup')();

let port = 3333;
const index = Math.max(process.argv.indexOf('--port'), process.argv.indexOf('-p'));
if (index !== -1) {
  port = +process.argv[index + 1];
}

const connections = {};
let id = 0;

const uWS = require('uWebSockets.js');
uWS.App().ws('/*', {
  /* Options */
  compression: 0,
  maxPayloadLength: 16 * 1024 * 1024,
  idleTimeout: 120,
  /* Handlers */
  open: (ws, req) => {
    connections[id] = ws;
    ws.id = id;
    ws.send(`${id}`);
    global.console.log('A WebSocket connected via URL: ' + req.getUrl() + '! id: ', id);
    id++;
  },
  message: (ws, message) => {
    /* Ok is false if backpressure was built up, wait for drain */
    message = parseBuffer(message);
    global.console.log(`message received ${ws.id}: `, message);
    etg.resolve(message.query, message.variables, { random: 1 }).then(json => {
      const res = {};
      res.result = json;
      res.sifrrQueryId = message.sifrrQueryId;
      let ok = ws.send(JSON.stringify(res));
      if (!ok) {
        global.console.log(`Message sending to websocket ${ws.id} failed:`, res);
      } else {
        global.console.log(`Message sent to websocket ${ws.id}:`, res);
      }
    });
  },
  drain: (ws) => {
    global.console.log('WebSocket backpressure: ' + ws.getBufferedAmount());
  },
  close: (ws, code, message) => {
    global.console.log(`WebSocket ${ws.id} closed: ${parseBuffer(message)}`);
  }
}).listen(port, (token) => {
  if (token) {
    global.console.log('Listening to port ' + port);
  } else {
    global.console.log('Failed to listen to port ' + port);
  }
});

function parseBuffer(buf) {
  let ret = Buffer.from(buf).toString('utf8');
  try {
    return JSON.parse(ret);
  } catch(e) {
    return ret;
  }
}
