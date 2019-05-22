/*! Sifrr.Fetch v0.0.5 - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */
const ObjConst = ({}).constructor;
class Request {
  constructor(url, options) {
    this._options = options;
    this._url = url;
  }
  response() {
    const me = this;
    return window.fetch(this.url, this.options).then(resp => {
      const contentType = resp.headers.get('content-type');
      const isJson = contentType && (contentType.includes('application/json'));
      if (resp.ok && typeof me._options.onProgress === 'function') {
        const contentLength = resp.headers.get('content-length');
        const total = parseInt(contentLength,10);
        if (!total || !resp.body || !ReadableStream) {
          me._options.onProgress(100);
        } else {
          const reader = resp.body.getReader();
          let loaded = 0;
          resp = new Response(new ReadableStream({
            start(controller) {
              const start = performance.now();
              function read() {
                return reader.read().then(({ done, value }) => {
                  if (done) {
                    me._options.onProgress(100, 0);
                    controller.close();
                  } else {
                    loaded += value.byteLength;
                    me._options.onProgress(loaded / total * 100, loaded / (performance.now() - start));
                    controller.enqueue(value);
                    return read();
                  }
                });
              }
              return read();
            }
          }));
        }
      } else if (!resp.ok) {
        if (typeof me._options.onProgress === 'function') me._options.onProgress(100);
        let error = Error(resp.statusText);
        error.response = resp;
        throw error;
      }
      return {
        response: resp,
        isJson
      };
    }).then(({ response, isJson }) => {
      if(isJson) return response.json();
      return response;
    });
  }
  get url() {
    const params = this._options.params;
    if (params && Object.keys(params).length > 0) {
      return this._url + '?' + Object.keys(params).map(k =>
        encodeURIComponent(k) + '=' + encodeURIComponent(params[k])
      ).join('&');
    } else {
      return this._url;
    }
  }
  get options() {
    const options = Object.assign({
      redirect: 'follow'
    }, this._options);
    options.headers = this._options.headers || {};
    if (options.body && options.body.constructor === ObjConst) {
      options.headers['content-type'] = options.headers['content-type'] || 'application/json';
      options.body = JSON.stringify(options.body);
    }
    return options;
  }
}
var request = Request;

class WebSocket {
  constructor(url, protocol, fallback = () => Promise.reject(Error('No fallback provided for websocket failure.'))) {
    this.url = url;
    this.protocol = protocol;
    this._fallback = !window.WebSocket;
    this.fallback = fallback;
    this.id = 1;
    this._requests = {};
    this._openSocket();
  }
  send(data, type) {
    if (data.constructor === ({}).constructor) {
      return this.sendJSON(data, type);
    } else {
      return this.sendRaw(data, this.id++);
    }
  }
  sendJSON(data, type = 'JSON') {
    const message = {
      data,
      sifrrQueryType: type,
      sifrrQueryId: this.id++
    };
    return this.sendRaw(JSON.stringify(message), message.sifrrQueryId, data);
  }
  sendRaw(message, id, original = message) {
    if (this._fallback) return this.fallback(original);
    return this._openSocket().then(ws => {
      ws.send(message);
      return new Promise((res) => {
        this._requests[id] = {
          res: (v) => {
            delete this._requests[id];
            res(v);
          },
          original
        };
      });
    }).catch((e) => {
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
  onerror() {
    this._fallback = !!this.fallback;
    for (let r in this._requests) {
      const req = this._requests[r];
      this.fallback(req.data).then(result => req.res(result));
    }
  }
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
var websocket = WebSocket;

class SifrrFetch {
  static get(url, options) {
    return this.request(url, options, 'GET');
  }
  static post(url, options) {
    return this.request(url, options, 'POST');
  }
  static put(url, options) {
    return this.request(url, options, 'PUT');
  }
  static delete(url, options) {
    return this.request(url, options, 'DELETE');
  }
  static graphql(url, options) {
    const { query, variables = {} } = options;
    delete options.query;
    delete options.variables;
    options.headers = options.headers || {};
    options.headers['Content-Type'] = 'application/json';
    options.headers['Accept'] = 'application/json';
    options.body = {
      query,
      variables
    };
    return this.request(url, options, 'POST');
  }
  static socket(url, protocol, fallback) {
    return new websocket(url, protocol, fallback);
  }
  static file(url, options = {}) {
    options.headers = options.headers || {};
    options.headers.accept = options.headers.accept || '*/*';
    return this.request(url, options);
  }
  static request(u, o = {}, m = 'GET') {
    let promise = Promise.resolve({ url: u, options: o, method: m });
    if (typeof o.before === 'function') (promise = promise.then(o.before)) && delete o.before;
    let current = 'then';
    if (typeof o.use === 'function') {
      current = 'catch';
      promise = promise.then(({ url, options, method }) => {
        return Promise.resolve(true).then(() => {
          const r = o.use({ url, options, method });
          delete o.use;
          return r;
        }).catch((e) => {
          window.console.error(e);
          throw { url, options, method };
        });
      });
    }
    promise = promise[current](({ url, options, method }) => {
      options.method = method;
      return new request(url, options).response();
    });
    if (typeof o.after === 'function') (promise = promise.then(o.after)) && delete o.after;
    return promise;
  }
}
SifrrFetch._middlewares = [];
SifrrFetch.WebSocket = websocket;
var sifrr_fetch = SifrrFetch;

export default sifrr_fetch;
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.fetch.module.js.map
