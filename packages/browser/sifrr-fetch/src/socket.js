const GRAPHQL_START = 'start';
const GRAPHQL_STOP = 'stop';

class Socket {
  constructor(
    url,
    protocol,
    fallback = () => Promise.reject(Error('No fallback provided for websocket failure.'))
  ) {
    this.url = url;
    this.protocol = protocol;
    this._fallback = !WebSocket;
    this.fallback = fallback;
    this.id = 1;
    this._requests = {};
    this._openSocket();
  }

  graphql(payload) {
    const id = this.id++;
    return this.sendRaw(JSON.stringify({ id, type: 'query', payload }), id);
  }

  subscribe(payload, callback) {
    if (typeof callback !== 'function') throw Error('Callback should be given for subscribing.');
    return this.send(payload, GRAPHQL_START, callback);
  }

  unsubscribe(id) {
    this.sendRaw(JSON.stringify({ id, type: GRAPHQL_STOP }), this.id++);
    delete this._requests[id];
    return Promise.resolve(id);
  }

  send(payload, type = 'sifrr-fetch', callback) {
    const message = {
      payload,
      type: type,
      id: this.id++
    };
    return this.sendRaw(JSON.stringify(message), message.id, payload, callback);
  }

  sendRaw(message, id, original = message, callback) {
    const isCallback = typeof callback === 'function';
    if (this._fallback) return this.fallback(original);
    return this._openSocket()
      .then(ws => {
        ws.send(message);
        return new Promise(res => {
          if (isCallback) res(id);
          this._requests[id] = {
            res: v => {
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
      .catch(e => {
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

  _onmessage(event) {
    const data = JSON.parse(event.data);
    if (data.id && this._requests[data.id]) {
      this._requests[data.id].res(data.payload);
    }
    this.onmessage(event);
  }

  onmessage() {}
}

export default Socket;
