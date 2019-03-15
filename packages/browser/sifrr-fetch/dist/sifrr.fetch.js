/*! Sifrr.Fetch v0.0.3 - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, (global.Sifrr = global.Sifrr || {}, global.Sifrr.Fetch = factory()));
}(this, function () { 'use strict';

  class Request {
    constructor(url, options) {
      this._options = options;
      this._url = url;
    }
    get response() {
      const me = this;
      return window.fetch(this.url, this.options).then(resp => {
        const contentType = resp.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        if (resp.ok && typeof me._options.onProgress === 'function') {
          const contentLength = resp.headers.get('content-length');
          const total = parseInt(contentLength, 10);
          if (!total || !resp.body) {
            me._options.onProgress(100);
          } else {
            const reader = resp.body.getReader();
            let loaded = 0;
            resp = new Response(new ReadableStream({
              start(controller) {
                function read() {
                  return reader.read().then(({
                    done,
                    value
                  }) => {
                    if (done) {
                      me._options.onProgress(100);
                      controller.close();
                    } else {
                      loaded += value.byteLength;
                      me._options.onProgress(loaded / total * 100);
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
      }).then(({
        response,
        isJson
      }) => {
        if (isJson) return response.json();
        return response;
      });
    }
    get url() {
      const params = this._options.params;
      if (params && Object.keys(params).length > 0) {
        return this._url + '?' + Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&');
      } else {
        return this._url;
      }
    }
    get options() {
      const options = Object.assign({
        redirect: 'follow'
      }, this._options);
      options.headers = Object.assign({
        accept: 'application/json'
      }, this._options.headers || {});
      if (options.body && options.body.constructor === {}.constructor) {
        options.headers['content-type'] = 'application/json';
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
    async send(data, event = 'SIFRR') {
      const id = this.id;
      this.id++;
      const message = {};
      message.event = event;
      message.sifrrQueryId = id;
      if (this._fallback) return this.fallback(data);
      const sock = await this._openSocket();
      if (!sock) return this.fallback(data);
      message.data = data;
      this.ws.send(JSON.stringify(message));
      const ret = new Promise(res => {
        this._requests[id] = {
          res: v => {
            delete this._requests[id];
            res(v);
          },
          data
        };
      });
      return ret;
    }
    _openSocket() {
      if (!this.ws) {
        this.ws = new window.WebSocket(this.url, this.protocol);
        this.ws.onopen = this.onopen.bind(this);
        this.ws.onerror = this.onerror.bind(this);
        this.ws.onclose = this.onclose.bind(this);
        this.ws.onmessage = this.onmessage.bind(this);
      } else if (this.ws.readyState === this.ws.OPEN) {
        return Promise.resolve(true);
      }
      const me = this;
      return new Promise(res => {
        function waiting() {
          if (me.ws.readyState === me.ws.CONNECTING) {
            window.requestAnimationFrame(waiting);
          } else if (me.ws.readyState !== me.ws.OPEN) {
            window.console.error(`Failed to open socket on ${me.url}`);
            res(false);
          } else {
            res(true);
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
    onmessage(event) {
      const data = JSON.parse(event.data);
      if (data.sifrrQueryId) this._requests[data.sifrrQueryId].res(data.data);
      delete this._requests[data.sifrrQueryId];
    }
  }
  var websocket = WebSocket;

  class SifrrFetch {
    static get(purl, poptions) {
      return this.request(purl, poptions, 'GET');
    }
    static post(purl, poptions) {
      return this.request(purl, poptions, 'POST');
    }
    static put(purl, poptions) {
      return this.request(purl, poptions, 'PUT');
    }
    static delete(purl, poptions) {
      return this.request(purl, poptions, 'DELETE');
    }
    static graphql(purl, poptions = {}) {
      const {
        query,
        variables = {}
      } = poptions;
      delete poptions.query;
      delete poptions.variables;
      poptions.headers = poptions.headers || {};
      poptions.headers['Content-Type'] = 'application/json';
      poptions.headers['Accept'] = 'application/json';
      poptions.body = {
        query,
        variables
      };
      return this.request(purl, poptions, 'POST');
    }
    static socket(url, protocol, fallback) {
      return new websocket(url, protocol, fallback ? message => {
        const options = {},
              method = fallback.method.toLowerCase();
        options.headers = options.headers || {};
        options.headers['content-type'] = options.headers['content-type'] || 'application/json';
        if (method === 'post') options.body = message;else options.query = message;
        return this[method](fallback.url, options);
      } : undefined);
    }
    static file(purl, poptions = {}) {
      poptions.headers = poptions.headers || {};
      poptions.headers.accept = poptions.headers.accept || '*/*';
      return this.request(purl, poptions, 'GET');
    }
    static request(purl, poptions = {}, method) {
      const {
        url,
        options
      } = this.afterUse(purl, poptions, method);
      return new request(url, options).response;
    }
    static use(fxn) {
      SifrrFetch._middlewares.push(fxn);
    }
    static afterUse(url, options = {}, method) {
      options.method = (options.method || method).toUpperCase();
      SifrrFetch._middlewares.forEach(fxn => {
        const res = fxn(url, options);
        url = res.url;
        options = res.options;
      });
      return {
        url,
        options
      };
    }
  }
  SifrrFetch._middlewares = [];
  SifrrFetch.WebSocket = websocket;
  var sifrr_fetch = SifrrFetch;

  return sifrr_fetch;

}));
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.fetch.js.map
