class WebSocket {
  constructor(
    url,
    protocol,
    fallback = () => Promise.reject(Error('No fallback provided for websocket failure.'))
  ) {
    this.url = url;
    this.protocol = protocol;
    this._fallback = !window.WebSocket;
    this.fallback = fallback;
    this.id = 1;
    this._requests = {};
    this._openSocket();
  }

  send(data, type = 'JSON') {
    const message = {
      data,
      sifrrQueryType: type,
      sifrrQueryId: this.id++
    };
    return this.sendRaw(JSON.stringify(message), message.sifrrQueryId, data);
  }

  sendRaw(message, id, original = message) {
    if (this._fallback) return this.fallback(original);
    return this._openSocket()
      .then(ws => {
        ws.send(message);
        return new Promise(res => {
          this._requests[id] = {
            res: v => {
              delete this._requests[id];
              res(v);
            },
            original
          };
        });
      })
      .catch(e => {
        window.console.error(e);
        return this.fallback(original);
      });
  }

  _openSocket() {
    if (!this.ws) {
      this.ws = new window.WebSocket(this.url, this.protocol);
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
          window.requestAnimationFrame(waiting);
        } else if (me.ws.readyState !== me.ws.OPEN) {
          rej(Error(`Failed to open socket on ${me.url}`));
        } else {
          res(me.ws);
        }
      }
      window.requestAnimationFrame(waiting);
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
    if (data.sifrrQueryId) this._requests[data.sifrrQueryId].res(data.data);
    delete this._requests[data.sifrrQueryId];
    this.onmessage(event);
  }

  onmessage() {}
}

module.exports = WebSocket;
