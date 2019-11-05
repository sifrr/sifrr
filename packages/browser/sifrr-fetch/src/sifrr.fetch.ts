import Request from './request';
import Socket from './socket';
import { SifrrFetchOptions, beforeOpts } from './types';

const httpMethods = ['GET', 'POST', 'PUT', 'OPTIONS', 'PATCH', 'HEAD', 'DELETE'];
const isAbort = !!window.AbortController;
class SifrrFetch {
  static graphqlPath: string = '/graphql';
  static Socket = Socket;

  static graphql(url: string | SifrrFetchOptions, options: SifrrFetchOptions) {
    if (typeof url !== 'string') {
      options = url;
      url = this.graphqlPath;
    }

    const { query, variables } = options;
    delete options.query;
    delete options.variables;
    options.headers = options.headers || {};
    options.headers['accept'] = 'application/json';
    options.body = {
      query,
      variables
    };
    return this.request(url, options, 'POST');
  }

  static socket(url: string, protocols: string, fallback: () => Promise<never>) {
    return new Socket(url, protocols, fallback);
  }

  static request(u: string, o: SifrrFetchOptions = {}, m = 'GET') {
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
    let controller: AbortController;
    if (isAbort) controller = new AbortController();
    promise = promise[current](({ url, options, method }: beforeOpts) => {
      options.method = options.method || method;
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

  graphqlPath = '';
  defaultOptions: SifrrFetchOptions;

  constructor(defaultOptions: SifrrFetchOptions = {}) {
    this.defaultOptions = defaultOptions;
    this.graphqlPath = '/graphql';
  }

  graphql(url: string, options: SifrrFetchOptions) {
    if (typeof url === 'string') {
      return (<typeof SifrrFetch>this.constructor).graphql(url, this._tOptions(options));
    } else {
      return (<typeof SifrrFetch>this.constructor).graphql(this.graphqlPath, this._tOptions(url));
    }
  }

  private _tOptions(options: SifrrFetchOptions) {
    options.defaultOptions = this.defaultOptions;
    return options;
  }
}

httpMethods.forEach(m => {
  const ml = m.toLowerCase();
  SifrrFetch[ml] = function(url: string, options: SifrrFetchOptions) {
    return SifrrFetch.request(url, options, m);
  };

  SifrrFetch.prototype[ml] = function(url: string, options: SifrrFetchOptions) {
    return SifrrFetch[ml](url, this._tOptions(options));
  };
});

export { SifrrFetch as Fetch, Socket };
export default SifrrFetch;
