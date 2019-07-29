import Request from './request';
import Socket from './socket';

const httpMethods = ['GET', 'POST', 'PUT', 'OPTIONS', 'PATCH', 'HEAD', 'DELETE'];
const isAbort = !!window.AbortController;
class SifrrFetch {
  static graphql(url, options) {
    const { query, variables } = options;
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
    let controller;
    if (isAbort) controller = new AbortController();
    promise = promise[current](({ url, options, method }) => {
      options.method = options.method || method;
      if (isAbort) options.signal = controller.signal;
      const response = new Request(url, options).response();
      return Promise.race([
        response,
        options.timeout
          ? new Promise((_, reject) =>
              setTimeout(() => reject(new Error('timeout')), options.timeout)
            ).catch(e => {
              if (isAbort) controller.abort();
              throw e;
            })
          : response
      ]);
    });

    if (typeof o.after === 'function') promise = promise.then(o.after);
    if (isAbort) promise.abort = controller.abort.bind(controller);
    return promise;
  }

  constructor(defaultOptions = {}) {
    this.defaultOptions = defaultOptions;
  }

  graphql(url, options) {
    return this.constructor.graphql(url, this._tOptions(options));
  }

  _tOptions(options) {
    options.defaultOptions = this.defaultOptions;
    return options;
  }
}

httpMethods.forEach(m => {
  const ml = m.toLowerCase();
  SifrrFetch[ml] = function(url, options) {
    return this.request(url, options, m);
  };

  SifrrFetch.prototype[ml] = function(url, options) {
    return this.constructor[ml](url, this._tOptions(options));
  };
});

SifrrFetch.Socket = Socket;

export { SifrrFetch as Fetch, Socket };
export default SifrrFetch;
