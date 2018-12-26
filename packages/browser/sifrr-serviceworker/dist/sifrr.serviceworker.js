/*! Sifrr.Serviceworker v0.0.1-alpha - sifrr project - 2018/12/26 15:18:15 UTC */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Sifrr = global.Sifrr || {}, global.Sifrr.Serviceworker = factory());
}(this, (function () { 'use strict';

  class SW {
    constructor(options) {
      this.options = Object.assign({
        version: 1,
        fallbackCacheName: 'fallbacks',
        defaultCacheName: 'default',
        policies: {},
        fallbacks: {},
        precacheUrls: []
      }, options);
      this.options.policies.default = Object.assign(this.options.policies.default || {}, {
        policy: 'NETWORK_FIRST',
        cacheName: this.options.defaultCacheName
      });
      this.options.fallbacks.default = this.options.fallbacks.default || '/offline.html';
    }
    precache(urls = this.options.precacheUrls, fbs = this.options.fallbacks) {
      const me = this;
      let promises = [];
      urls.forEach(u => {
        let req = me.requestFromURL(u);
        return promises.push(me.responseFromNetwork(req, me.findRegex(u, me.options.policies).cacheName || me.options.defaultCacheName));
      });
      for (let value of Object.values(fbs)) {
        let req = this.requestFromURL(value);
        promises.push(this.responseFromNetwork(req, this.options.fallbackCacheName));
      }
      return Promise.all(promises);
    }
    setup() {
      let me = this;
      self.addEventListener('install', event => {
        self.skipWaiting();
        event.waitUntil(me.precache());
      });
      self.addEventListener('activate', () => {
        const version = '-v' + me.options.version;
        caches.keys().then(cacheNames => {
          return cacheNames.filter(cacheName => cacheName.indexOf(version) < 0);
        }).then(cachesToDelete => {
          return Promise.all(cachesToDelete.map(cacheToDelete => {
            return caches.delete(cacheToDelete);
          }));
        }).then(() => self.clients.claim());
      });
      self.addEventListener('fetch', event => {
        const request = event.request;
        const otherReq = request.clone();
        const oreq = request.clone();
        if (request.method === 'GET') {
          event.respondWith(me.respondWithPolicy(request).then(response => {
            if (!response.ok && response.status > 0 && me.findRegex(oreq.url, me.options.fallbacks)) {
              throw Error('response status ' + response.status);
            }
            return response;
          }).catch(() => me.respondWithFallback(otherReq)));
        }
      });
    }
    setupPushNotification(defaultTitle = '', defaultOptions = { 'body': '' }, onNotificationClick) {
      self.addEventListener('push', function (event) {
        let data = {};
        if (event.data) {
          data = event.data.json();
        }
        const title = data.title || defaultTitle;
        const options = Object.assign(defaultOptions, data);
        event.waitUntil(self.registration.showNotification(title, options));
      });
      self.addEventListener('notificationclick', onNotificationClick);
    }
    respondWithFallback(request) {
      const fallback = this.requestFromURL(this.findRegex(request.url, this.options.fallbacks));
      return this.responseFromCache(fallback, this.options.fallbackCacheName);
    }
    respondWithPolicy(request) {
      const newreq = request.clone();
      const config = this.findRegex(request.url, this.options.policies);
      const policy = config.policy || 'NETWORK_FIRST';
      const cacheName = config.cacheName || this.options.defaultCacheName;
      let resp;
      switch (policy) {
        case 'NETWORK_ONLY':
          resp = this.responseFromNetwork(newreq, cacheName, false);
          break;
        case ('CACHE_ONLY'):
          resp = this.responseFromCache(newreq, cacheName).catch(() => this.responseFromNetwork(request, cacheName));
          break;
        case 'NETWORK_FIRST':
          resp = this.responseFromNetwork(newreq, cacheName).catch(() => this.responseFromCache(request, cacheName));
          break;
        default:
          resp = this.responseFromNetwork(newreq, cacheName).catch(() => this.responseFromCache(request, cacheName));
          break;
      }
      return resp;
    }
    responseFromNetwork(request, cache, putInCache = true) {
      return caches.open(cache + '-v' + this.options.version).then(cache => fetch(request).then(response => {
        if (putInCache) cache.put(request, response.clone());
        return response;
      }));
    }
    responseFromCache(request, cache) {
      return caches.open(cache + '-v' + this.options.version).then(cache => cache.match(request)).then(resp => {
        if (resp) return resp;else throw 'Cache not found for ' + request.url;
      });
    }
    requestFromURL(url, method = 'GET') {
      return new Request(url, {
        method: method
      });
    }
    findRegex(url, policies) {
      for (let [key, value] of Object.entries(policies)) {
        const regex = new RegExp(key);
        if (regex.test(url)) return value;
      }
      return policies['default'];
    }
  }
  var sifrr_serviceworker = SW;

  return sifrr_serviceworker;

})));
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.serviceworker.js.map
