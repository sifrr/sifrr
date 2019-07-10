const websockets = {};
let id = 0;

const wsConfig = {
  open: ws => {
    websockets[id] = {
      dirty: false
    };
    ws.id = id;
    console.log('websocket connected: ', id);
    id++;
  },
  message: ws => {
    ws.send(JSON.stringify(websockets[ws.id].dirty));
    websockets[ws.id].dirty = false;
  },
  close: (ws, code, message) => {
    delete websockets[ws.id];
    console.log(
      `websocket disconnected with code ${code} and message ${message}:`,
      ws.id,
      websockets
    );
  }
};

const jsCode = path => `
  (() => {
    let ws, ttr = 500, timeout;
    
    function newWsConnection() {
      ws = new WebSocket("ws://${path}");
      ws.onopen = function(event) {
        ttr = 500;
        checkMessage();
        console.log('watching for file changes through sifrr-server livereload mode.');
      };
      ws.onmessage = function(event) {
        if (JSON.parse(event.data)) {
          console.log('Files changed, refreshing page.');
          location.reload();
        }
      };
      ws.onerror = (e) => {
        console.error('Webosocket error: ', e);
        console.log('Retrying after ', ttr / 4, 'ms');
        ttr *= 4;
      };
      ws.onclose = (e) => {
        console.error(\`Webosocket closed with code \${e.code} error \${e.message}\`);
      };
    }

    function checkMessage() {
      if (!ws) return;
      if (ws.readyState === WebSocket.OPEN) ws.send('');
      else if (ws.readyState === WebSocket.CLOSED) newWsConnection();

      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(checkMessage, ttr);
    }

    newWsConnection();
    setTimeout(checkMessage, ttr);
  })();
`;

const sendSignal = (type, path) => {
  console.log(type, 'signal for file: ', path);
  for (let i in websockets) websockets[i].dirty = true;
};

module.exports = {
  websockets,
  wsConfig,
  jsCode,
  sendSignal
};
