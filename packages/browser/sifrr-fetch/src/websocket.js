class WebSocket {
  constructor(url, protocol, fallback) {
    this.url = url;
    this.protocol = protocol;
    this._fallback = !window.WebSocket;
    this.fallback = fallback;
    this.id = 1;
    this._requests = {};
    this._openSocket();
  }

  async send(message) {
    if (this._fallback) return this.fallback(message);
    const id = this.id;
    this.id++;
    await this._openSocket();
    message.sifrrQueryId = id;
    this.ws.send(JSON.stringify(message));
    const ret = new Promise((res) => {
      this._requests[id] = {
        res: (v) => {
          delete this._requests[id];
          res(v);
        },
        message
      };
    });
    return ret;
  }

  _openSocket() {
    if (!this.ws || this.ws.readyState === this.ws.CLOSED || this.ws.readyState === this.ws.CLOSING) {
      this.ws = new window.WebSocket(this.url, this.protocol);
      this.ws.onopen = this.onopen.bind(this);
      this.ws.onerror = this.onerror.bind(this);
      this.ws.onclose = this.onclose.bind(this);
      this.ws.onmessage = this.onmessage.bind(this);
      const me = this;
      return new Promise(res => {
        function waiting() {
          if (me.ws.readyState !== me.ws.OPEN) {
            window.requestAnimationFrame(waiting);
          } else {
            res();
          }
        }
        window.requestAnimationFrame(waiting);
      });
    }
    return Promise.resolve(true);
  }

  onerror() {
    this._fallback = !!this.fallback;
    for (let r in this._requests) {
      const req = this._requests[r];
      this.fallback(req.message).then(result => req.res(result));
    }
  }

  onopen() {}

  onclose() {}

  onmessage(event) {
    const data = JSON.parse(event.data);
    if (data.sifrrQueryId) this._requests[data.sifrrQueryId].res(data.result);
    delete this._requests[data.sifrrQueryId];
  }
}

module.exports = WebSocket;
