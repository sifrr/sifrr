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

  static request(u, o = {}, m = 'GET') {
    let promise = Promise.resolve({ url: u, options: o, method: m });
    if (typeof o.before === 'function') (promise = promise.then(o.before)) && delete o.before;

    let current = 'then';
    if (typeof o.use === 'function') {
      // if o.use errors, send request normally, else return
      current = 'catch';
      promise = promise.then(({ url, options, method }) => {
        return Promise.resolve(true)
          .then(() => {
            const r = o.use({ url, options, method });
            delete o.use;
            return r;
          })
          .catch(e => {
            window.console.error(e);
            throw { url, options, method };
          });
      });
    }
    promise = promise[current](({ url, options, method }) => {
      options.method = options.method || method;
      const response = new Request(url, options).response();
      return Promise.race([
        response,
        options.timeout
          ? new Promise((_, reject) =>
              setTimeout(() => reject(new Error('timeout')), options.timeout)
            )
          : response
      ]);
    });

    if (typeof o.after === 'function') promise = promise.then(o.after);
    return promise;
  }

  constructor(defaultOptions = {}) {
    this.defaultOptions = defaultOptions;
  }

  get(url, options) {
    return this.constructor.get(url, this._tOptions(options));
  }

  post(url, options) {
    return this.constructor.post(url, this._tOptions(options));
  }

  put(url, options) {
    return this.constructor.put(url, this._tOptions(options));
  }

  delete(url, options) {
    return this.constructor.delete(url, this._tOptions(options));
  }

  graphql(url, options) {
    return this.constructor.graphql(url, this._tOptions(options));
  }

  _tOptions(options) {
    options.defaultOptions = this.defaultOptions;
    return options;
  }
}

SifrrFetch.WebSocket = WebSocket;
module.exports = SifrrFetch;
