/*! Sifrr.Fetch v0.0.2-alpha - sifrr project */
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
      return window.fetch(this.url, this.options).then(resp => {
        let contentType = resp.headers.get('content-type');
        if (resp.ok) {
          if (contentType && contentType.includes('application/json')) {
            resp = resp.json();
          }
          return resp;
        } else {
          let error = Error(resp.statusText);
          error.response = resp;
          throw error;
        }
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
