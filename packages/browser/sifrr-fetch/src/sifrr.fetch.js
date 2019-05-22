const Request = require('./request');
const WebSocket = require('./websocket');

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
    return new WebSocket(url, protocol, fallback);
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
      return new Request(url, options).response();
    });
    if (typeof o.after === 'function') (promise = promise.then(o.after)) && delete o.after;
    return promise;
  }
}

SifrrFetch._middlewares = [];
SifrrFetch.WebSocket = WebSocket;

module.exports = SifrrFetch;
