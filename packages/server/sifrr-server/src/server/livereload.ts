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

const sendSignal = (type, path) => {
  console.log(type, 'signal for file: ', path);
  for (let i in websockets) websockets[i].dirty = true;
};

export default { websockets, wsConfig, sendSignal };
export { websockets, wsConfig, sendSignal };
