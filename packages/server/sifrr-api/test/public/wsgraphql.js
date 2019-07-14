const { createContext, EXPECTED_OPTIONS_KEY } = require('dataloader-sequelize');

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
uWS
  .App()
  .ws('/*', {
    /* Options */
    compression: 0,
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
      if (ENV == 'development') global.console.log(`message received ${ws.id}: `, message);
      if (message.event === 'GRAPHQL_QUERY') {
        const data = message.data;
        etg
          .resolve(data.query, data.variables, {
            [EXPECTED_OPTIONS_KEY]: createContext(require('./sequelize').sequelize),
            random: 1
          })
          .then(json => {
            const res = {};
            res.status = 'ok';
            res.event = 'GRAPHQL_QUERY';
            res.data = json;
            res.sifrrQueryId = message.sifrrQueryId;
            let ok = ws.send(JSON.stringify(res));
            if (!ok) {
              if (ENV == 'development')
                global.console.log(`Message sending to websocket ${ws.id} failed:`, res);
            } else {
              if (ENV == 'development')
                global.console.log(`Message sent to websocket ${ws.id}:`, res);
            }
          });
      } else {
        const res = {};
        res.sifrrQueryId = message.sifrrQueryId;
        res.data = { user: 1 };
        let ok = ws.send(JSON.stringify(res));
        if (!ok) {
          if (ENV == 'development')
            global.console.log(`Message sending to websocket ${ws.id} failed:`, res);
        } else {
          if (ENV == 'development') global.console.log(`Message sent to websocket ${ws.id}:`, res);
        }
      }
    },
    drain: ws => {
      global.console.log('WebSocket backpressure: ' + ws.getBufferedAmount());
    },
    close: (ws, code, message) => {
      global.console.log(`WebSocket ${ws.id} closed: ${parseBuffer(message)}`);
    }
  })
  .listen(port, token => {
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
  } catch (e) {
    return ret;
  }
}
