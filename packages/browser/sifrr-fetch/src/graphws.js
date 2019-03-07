class GraphWS {
  constructor(url, protocol, fallback) {
    this.url = url;
    this.protocol = protocol;
    this.fallback = fallback;
    this.id = 1;
    this._resolvers = {};
    this._openSocket();
  }

  async send(query, variables = {}) {
    const id = this.id;
    this.id++;
    await this._openSocket();
    const message = {
      query: query,
      variables: variables,
      sifrrQueryId: id
    };
    this.ws.send(JSON.stringify(message));
    const ret = new Promise((res) => {
      this._resolvers[id] = (v) => {
        delete this._resolvers[id];
        res(v);
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

  onerror(e) {
    window.console.error(`Sifrr WebSocket(${this.url}) error:`, e);
  }

  onopen() {}

  onclose() {}

  onmessage(event) {
    const data = JSON.parse(event.data);
    if (data.sifrrQueryId) this._resolvers[data.sifrrQueryId](data.result);
  }
}

module.exports = GraphWS;
