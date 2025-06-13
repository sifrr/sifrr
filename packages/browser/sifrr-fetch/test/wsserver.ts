import { SifrrServer } from '@sifrr/server';
import { WebSocket } from 'uWebSockets.js';
import { readFileSync } from 'fs';
import { join } from 'path';

const wsapp = new SifrrServer();
const connections: Record<string, WebSocket<any>> = {};
let id = 0;

function parseBuffer<T>(buf: ArrayBuffer): T {
  const ret = Buffer.from(buf).toString('utf8');
  try {
    return JSON.parse(ret);
  } catch (e) {
    return ret as T;
  }
}

wsapp.ws('/ws', {
  /* Options */
  maxPayloadLength: 1 * 1024 * 1024,
  idleTimeout: 120,
  /* Handlers */
  open: (ws) => {
    connections[id] = ws;
    (ws as any).id = id;
    ws.send(JSON.stringify({ connectionId: id }));
    id++;
  },
  message: (ws, ab) => {
    /* Ok is false if backpressure was built up, wait for drain */
    const message = parseBuffer<{ id: number; type: string; payload: any }>(ab);
    const res: Record<string, any> = {};
    res.id = message.id;
    if (message.type === 'FILE') {
      res.payload = readFileSync(join(__dirname, message.payload.url), 'UTF-8');
    } else {
      res.payload = { dataYouSent: message.payload };
    }
    ws.send(JSON.stringify(res));
  },
  drain: (ws) => {
    global.console.log('WebSocket backpressure: ' + ws.getBufferedAmount());
  },
  close: (ws, code, message) => {
    global.console.log(`WebSocket ${(ws as any).id} closed: ${parseBuffer(message)}`);
    delete connections[(ws as any).id];
  }
});

export default wsapp;
