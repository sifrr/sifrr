process.env.NODE_PATH = require('path').join(__dirname, './node_modules');
require('module').Module._initPaths();

let port = false;
const index = Math.max(process.argv.indexOf('--port'), process.argv.indexOf('-p'));
if (index !== -1) {
  port = +process.argv[index + 1];
}
global.ENV = port ? 'development' : 'test';

const { App } = require('@sifrr/server');
const fs = require('fs');
const path = require('path');
const Busboy = require('busboy');
const Duplex = require('stream').Duplex;

function webSocketServer(port) {
  const connections = {};
  let id = 0;

  const app = new App();
  app
    .ws('/*', {
      /* Options */
      maxPayloadLength: 1 * 1024 * 1024,
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
        let ok, res;
        res = {};
        res.id = message.id;
        if (message.type === 'FILE') {
          res.payload = fs.readFileSync(path.join(__dirname, message.payload.url), 'UTF-8');
        } else {
          res.payload = { dataYouSent: message.payload };
        }
        // setTimeout(() => {
        ok = ws.send(JSON.stringify(res));
        // }, Math.random() * 100);
        if (!ok) {
          if (ENV == 'development')
            global.console.log(`Message sending to websocket ${ws.id} failed:`, res);
        } else if (ENV == 'development')
          global.console.log(`Message sent to websocket ${ws.id}:`, res);
      },
      drain: (ws) => {
        global.console.log('WebSocket backpressure: ' + ws.getBufferedAmount());
      },
      close: (ws, code, message) => {
        global.console.log(`WebSocket ${ws.id} closed: ${parseBuffer(message)}`);
        delete connections[ws.id];
      }
    })
    .options('/*', (res) => {
      res.writeHeader('Access-Control-Allow-Origin', '*');
      res.writeHeader('Access-Control-Allow-Headers', 'content-type');
      res.end();
    })
    .post('/*', (res, req) => {
      const contType = req.getHeader('content-type');
      res.writeHeader('Access-Control-Allow-Origin', '*');
      res.writeHeader('Access-Control-Allow-Headers', 'content-type');
      if (contType === 'application/json') {
        res.writeHeader('content-type', 'application/json');
        readData(res, (obj) => {
          res.end(JSON.stringify({ dataYouSent: JSON.parse(obj) }));
        });
      } else {
        const busb = new Busboy({ headers: { 'content-type': contType } });
        readData(
          res,
          (obj) => {
            const stream = new Duplex();
            stream.push(obj);
            stream.push(null);
            stream.pipe(busb);
            const response = {};
            busb.on('file', function (fieldname, file, filename, encoding, mimetype) {
              const resp = {
                type: 'file',
                filename,
                encoding,
                mimetype,
                size: 0
              };
              file.on('data', function (data) {
                resp.size += data.length;
              });
              file.on('end', function () {
                if (Array.isArray(response[fieldname])) {
                  response[fieldname].push(resp);
                } else if (response[fieldname]) {
                  response[fieldname] = [response[fieldname], resp];
                } else {
                  response[fieldname] = resp;
                }
              });
            });
            busb.on('field', function (fieldname, value) {
              response[fieldname] = {
                type: 'field',
                fieldname,
                value
              };
            });
            busb.on('finish', function () {
              res.writeHeader('content-type', 'application/json');
              res.end(JSON.stringify(response));
            });
          },
          global.console.error
        );
      }
    })
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

function parseBuffer(buf) {
  const ret = Buffer.from(buf).toString('utf8');
  try {
    return JSON.parse(ret);
  } catch (e) {
    return ret;
  }
}

/* Helper function for reading a posted JSON body */
function readData(res, cb, err) {
  let buffer;
  /* Register data cb */
  res.onData((ab, isLast) => {
    const chunk = Buffer.from(ab);
    if (isLast) {
      if (buffer) {
        cb(Buffer.concat([buffer, chunk]));
      } else {
        cb(chunk);
      }
    } else if (buffer) {
      buffer = Buffer.concat([buffer, chunk]);
    } else {
      buffer = Buffer.concat([chunk]);
    }
  });
}

if (port) {
  webSocketServer(port);
}

module.exports = webSocketServer;
