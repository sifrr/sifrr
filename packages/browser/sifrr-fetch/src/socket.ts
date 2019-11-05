const GRAPHQL_START = 'start';
const GRAPHQL_STOP = 'stop';

class Socket {
  id = 1;
  _requests = {};

  url: string;
  protocol: string;
  ws: WebSocket;
  fallback: (message: string) => void;
  private _fallback: boolean;

  constructor(
    url: string,
    protocol: string,
    fallback = () => Promise.reject(Error('No fallback provided for websocket failure.'))
  ) {
    this.url = url;
    this.protocol = protocol;
    this._fallback = !WebSocket;
    this.fallback = fallback;
    this.id = 1;
    this._openSocket();
  }

  graphql(payload: any) {
    const id = this.id++;
    return this.sendRaw(JSON.stringify({ id, type: 'query', payload }), id);
  }

  subscribe(payload: any, callback: any) {
    if (typeof callback !== 'function') throw Error('Callback should be given for subscribing.');
    return this.send(payload, GRAPHQL_START, callback);
  }

  unsubscribe(id: number) {
    this.sendRaw(JSON.stringify({ id, type: GRAPHQL_STOP }), this.id++);
    delete this._requests[id];
    return Promise.resolve(id);
  }

  send(payload: any, type = 'sifrr-fetch', callback: any) {
    const message = {
      payload,
      type: type,
      id: this.id++
    };
    return this.sendRaw(JSON.stringify(message), message.id, payload, callback);
  }

  sendRaw(message: string, id?: number, original = message, callback?: (arg0: any) => void) {
    const isCallback = typeof callback === 'function';
    if (this._fallback) return this.fallback(original);
    return this._openSocket()
      .then((ws: { send: (arg0: any) => void }) => {
        ws.send(message);
        return new Promise(res => {
          if (isCallback) res(id);
          this._requests[id] = {
            res: (v: unknown) => {
              if (isCallback) {
                callback(v);
              } else {
                delete this._requests[id];
                res(v);
              }
            },
            original
          };
        });
      })
      .catch((e: any) => {
        console.error(e);
        return this.fallback(original);
      });
  }

  _openSocket() {
    if (!this.ws) {
      this.ws = new WebSocket(this.url, this.protocol);
      this.ws.onopen = this.onopen.bind(this);
      this.ws.onerror = this.onerror.bind(this);
      this.ws.onclose = this.onclose.bind(this);
      this.ws.onmessage = this._onmessage.bind(this);
    } else if (this.ws.readyState === this.ws.OPEN) {
      return Promise.resolve(this.ws);
    } else if (this.ws.readyState !== this.ws.CONNECTING) {
      this.ws = null;
      return this._openSocket();
    }
    const me = this;
    return new Promise((res, rej) => {
      function waiting() {
        if (me.ws.readyState === me.ws.CONNECTING) {
          setTimeout(waiting, 100);
        } else if (me.ws.readyState !== me.ws.OPEN) {
          rej(Error(`Failed to open socket on ${me.url}`));
        } else {
          res(me.ws);
        }
      }
      waiting();
    });
  }

  onerror() {}

  onopen() {}

  onclose() {}

  close() {
    this.ws.close();
  }

  _onmessage(event: { data: string }) {
    const data = JSON.parse(event.data);
    if (data.id && this._requests[data.id]) {
      this._requests[data.id].res(data.payload);
    }
    this.onmessage(event);
  }

  onmessage(e: { data: string }) {}
}

export default Socket;
