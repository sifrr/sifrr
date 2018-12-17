/*! Sifrr.Fetch v0.1.0-alpha - sifrr project - 2018/12/13 20:12:13 UTC */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Sifrr = global.Sifrr || {}, global.Sifrr.Fetch = factory());
}(this, (function () { 'use strict';

  class Request {
    constructor(type, url, options) {
      this.type = type;
      this._options = options;
      this._url = url;
    }
    get response() {
      return window.fetch(this.url, this.options).then(resp => {
        let contentType = resp.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          resp = resp.json();
        }
        if (resp.ok) {
          return resp;
        } else {
          let error = Error(resp.statusText);
          error.response = resp;
          throw error;
        }
      });
    }
    get url() {
      let params = delete this._options.params;
      if (params && Object.keys(params).length > 0) {
        return this._url + '?' + Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&');
      } else {
        return this._url;
      }
    }
    get options() {
      return Object.assign(this._options, {
        method: this.type,
        headers: Object.assign({
          'accept': 'application/json'
        }, this._options.headers || {}),
        mode: 'cors',
        redirect: 'follow'
      });
    }
  }
  var request = Request;

  class SifrrFetch {
    static get(url, options = {}) {
      return new request('GET', url, options).response;
    }
    static post(url, options = {}) {
      return new request('POST', url, options).response;
    }
    static put(url, options = {}) {
      return new request('PUT', url, options).response;
    }
    static delete(url, options = {}) {
      return new request('DELETE', url, options).response;
    }
    static file(url, options = {}) {
      options.headers = options.headers || {};
      options.headers.accept = options.headers.accept || '*/*';
      return new request('GET', url, options).response;
    }
  }
  var sifrr_fetch = SifrrFetch;

  return sifrr_fetch;

})));
/*! (c) @aadityataparia */
