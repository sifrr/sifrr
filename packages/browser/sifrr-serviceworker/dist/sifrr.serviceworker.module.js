/*! Sifrr.Serviceworker v0.0.2-alpha - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */
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
  }
  setup() {
    self.addEventListener('install', this.installEventListener.bind(this));
    self.addEventListener('activate', this.activateEventListener.bind(this));
    self.addEventListener('fetch', this.fetchEventListener.bind(this));
  }
  setupPushNotification(defaultTitle = '', defaultOptions = { body: '' }) {
    this.defaultPushTitle = defaultTitle;
    this.defaultPushOptions = defaultOptions;
    self.addEventListener('push', this.pushEventListener.bind(this));
    self.addEventListener('notificationclick', this.onNotificationClick.bind(this));
  }
  installEventListener(event) {
    event.waitUntil(this.precache());
    this.onInstall(event);
  }
  onInstall() {}
  activateEventListener() {
    const version = '-v' + this.options.version;
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => cacheName.indexOf(version) < 0);
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim());
  }
  fetchEventListener(event) {
    const request = event.request;
    const otherReq = request.clone();
    const oreq = request.clone();
    if (request.method === 'GET') {
      event.respondWith(this.respondWithPolicy(request).then(response => {
        if (!response.ok && response.status > 0 && this.findRegex(oreq.url, this.options.fallbacks)) {
          throw Error('response status ' + response.status);
        }
        return response;
      }).catch((e) => this.respondWithFallback(otherReq, e)));
    }
  }
  pushEventListener(event) {
    let data = {};
    if (event.data) {
      if (typeof event.data.json === 'function') data = event.data.json();
      else data = event.data.json;
    }
    const title = data.title || this.defaultPushTitle;
    const options = Object.assign(this.defaultPushOptions, data);
    return self.registration.showNotification(title, options);
  }
  onNotificationClick() {}
  precache(urls = this.options.precacheUrls, fbs = this.options.fallbacks) {
    const me = this;
    let promises = [];
    urls.forEach(u => {
      let req = me.requestFromURL(u);
      return promises.push(me.responseFromNetwork(req, me.findRegex(u, me.options.policies).cacheName));
    });
    for (let value of Object.values(fbs)) {
      let req = this.requestFromURL(value);
      promises.push(this.responseFromNetwork(req, this.options.fallbackCacheName));
    }
    return Promise.all(promises);
  }
  respondWithFallback(request, error) {
    const fallback = this.requestFromURL(this.findRegex(request.url, this.options.fallbacks));
    if (fallback !== undefined) {
      return this.responseFromCache(fallback, this.options.fallbackCacheName);
    } else {
      throw error;
    }
  }
  respondWithPolicy(request) {
    const req1 = request.clone();
    const req2 = request.clone();
    const config = this.findRegex(request.url, this.options.policies);
    const policy = config.policy;
    const cacheName = config.cacheName || this.options.defaultCacheName;
    let resp;
    switch (policy) {
    case 'NETWORK_ONLY':
      resp = this.responseFromNetwork(req1, cacheName, false);
      break;
    case 'CACHE_FIRST':
    case 'CACHE_ONLY':
      resp = this.responseFromCache(req1, cacheName)
        .catch(() => this.responseFromNetwork(request, cacheName));
      break;
    case 'CACHE_AND_UPDATE':
      resp = this.responseFromCache(req1, cacheName)
        .catch(() => this.responseFromNetwork(request, cacheName));
      this.responseFromNetwork(req2, cacheName);
      break;
    default:
      resp = this.responseFromNetwork(req1, cacheName)
        .catch(() => this.responseFromCache(request, cacheName));
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
      if (resp) return resp;
      else throw 'Cache not found for ' + request.url;
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

export default sifrr_serviceworker;
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.serviceworker.module.js.map
