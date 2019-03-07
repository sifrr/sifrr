/*! Sifrr.Fetch v0.0.3 - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, (global.Sifrr = global.Sifrr || {}, global.Sifrr.Fetch = factory()));
}(this, function () { 'use strict';

  class Request {
    constructor(url, options = {}) {
      this._options = options;
      this._url = url;
    }
    get response() {
      const me = this;
      return window.fetch(this.url, this.options).then(resp => {
        const contentType = resp.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        if (resp.ok) {
          if (typeof me._options.onProgress === 'function') {
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
          }
          return {
            response: resp,
            isJson
          };
        } else {
          if (typeof me._options.onProgress === 'function') me._options.onProgress(100);
          let error = Error(resp.statusText);
          error.response = resp;
          throw error;
        }
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
        mode: 'cors',
        redirect: 'follow',
        cache: 'no-cache'
      }, this._options);
      options.headers = Object.assign({
        accept: 'application/json'
      }, this._options.headers || {});
      if (typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
      }
      return options;
    }
  }
  var request = Request;

  class GraphWS {
    constructor(url, protocol, fallback) {
      this.url = url;
      this.protocol = protocol;
      this._fallback = !window.WebSocket;
      this.fallback = fallback;
      this.id = 1;
      this._requests = {};
      this._openSocket();
    }
    async send(query, variables = {}) {
      if (this._fallback) return this.fallback(query, variables);
      const id = this.id;
      this.id++;
      await this._openSocket();
      const message = {
        query: query,
        variables: variables,
        sifrrQueryId: id
      };
      this.ws.send(JSON.stringify(message));
      const ret = new Promise(res => {
        this._requests[id] = {
          res: v => {
            delete this._requests[id];
            res(v);
          },
          query,
          variables
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
        this.fallback(req.query, req.variables).then(result => req.res(result));
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
  var graphws = GraphWS;

  class SifrrFetch {
    static get(purl, poptions) {
      const {
        url,
        options
      } = this.afterUse(purl, poptions, 'GET');
      return new request(url, options).response;
    }
    static post(purl, poptions) {
      const {
        url,
        options
      } = this.afterUse(purl, poptions, 'POST');
      return new request(url, options).response;
    }
    static put(purl, poptions) {
      const {
        url,
        options
      } = this.afterUse(purl, poptions, 'PUT');
      return new request(url, options).response;
    }
    static delete(purl, poptions) {
      const {
        url,
        options
      } = this.afterUse(purl, poptions, 'DELETE');
      return new request(url, options).response;
    }
    static graphql(purl, poptions) {
      const {
        url,
        options
      } = this.afterUse(purl, poptions, 'POST');
      const {
        query,
        variables = {}
      } = options;
      delete options.query;
      delete options.variables;
      options.headers = options.headers || {};
      options.headers['Content-Type'] = 'application/json';
      options.headers['Accept'] = 'application/json';
      options.body = {
        query,
        variables
      };
      return new request(url, options).response;
    }
    static graphqlSocket(url, protocol, fallback) {
      return new graphws(url, protocol, fallback ? (query, variables) => {
        return this.graphql(fallback.url, {
          method: fallback.method.toUpperCase(),
          query,
          variables
        });
      } : false);
    }
    static file(purl, poptions) {
      const {
        url,
        options
      } = this.afterUse(purl, poptions, 'GET');
      options.headers = options.headers || {};
      options.headers.accept = options.headers.accept || '*/*';
      return new request(url, options).response;
    }
    static use(fxn) {
      SifrrFetch._middlewares.push(fxn);
    }
    static afterUse(url, options = {}, method) {
      options.method = method;
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
  var sifrr_fetch = SifrrFetch;

  return sifrr_fetch;

}));
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.fetch.js.map
