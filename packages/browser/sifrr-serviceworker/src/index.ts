import { SwOptions } from './types';

declare const self: ServiceWorkerGlobalScope;

class ServiceWorker {
  protected options: Required<SwOptions>;
  protected defaultPushTitle: string = '';
  protected defaultPushOptions?: NotificationOptions;
  protected defaultPolicy;

  constructor(options: SwOptions) {
    this.options = Object.assign(
      {
        version: 1,
        fallbackCacheName: 'fallbacks',
        defaultCacheName: 'default',
        policies: {},
        fallbacks: {},
        precacheUrls: []
      },
      options
    );
    this.defaultPolicy = {
      policy: 'NETWORK_FIRST',
      cacheName: this.options.defaultCacheName
    };
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

  protected installEventListener(event: ServiceWorkerGlobalScopeEventMap['install']) {
    event.waitUntil(this.precache());
    this.onInstall(event);
  }

  onInstall(_event: ServiceWorkerGlobalScopeEventMap['install']) {}

  protected activateEventListener() {
    const version = '-v' + this.options.version;
    // remove old version caches
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => !cacheName.endsWith(version));
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim());
  }

  protected fetchEventListener(event: ServiceWorkerGlobalScopeEventMap['fetch']) {
    const request = event.request;
    const otherReq = request.clone();
    if (request.method === 'GET') {
      event.respondWith(
        this.respondWithPolicy(request)
          .then((response) => {
            if (!response.ok && response.status > 0) {
              throw Error('Response status ' + response.status);
            }
            return response;
          })
          .catch((e: any) => this.respondWithFallback(otherReq, e))
      );
    }
  }

  protected pushEventListener(event: ServiceWorkerGlobalScopeEventMap['push']) {
    let data: {
      title?: string;
    } = {};
    if (event.data) {
      data = event.data.json();
    }

    const title = data.title ?? this.defaultPushTitle;
    const options: NotificationOptions = Object.assign({}, this.defaultPushOptions, data);

    return self.registration.showNotification(title, options);
  }

  onNotificationClick() {}

  precache(urls = this.options.precacheUrls, fbs = this.options.fallbacks) {
    const promises = [];
    urls.forEach((u) => {
      const req = this.createRequest(u);
      return promises.push(
        this.responseFromNetwork(
          req,
          this.findRegex(u, this.options.policies, this.defaultPolicy).cacheName ??
            this.defaultPolicy.cacheName
        )
      );
    });
    for (const url of Object.values(fbs)) {
      const req = this.createRequest(url);
      promises.push(this.responseFromNetwork(req, this.options.fallbackCacheName));
    }
    return Promise.all(promises);
  }

  respondWithFallback(request: { url: any }, error: any) {
    const fallback = this.findRegex(request.url, this.options.fallbacks);
    if (fallback !== undefined) {
      return this.responseFromCache(this.createRequest(fallback), this.options.fallbackCacheName);
    } else {
      throw error;
    }
  }

  respondWithPolicy(request: Request) {
    const req1 = request.clone();
    const config = this.findRegex(request.url, this.options.policies, this.defaultPolicy);
    const policy = config.policy;
    const cacheName = config.cacheName ?? this.options.defaultCacheName;

    let resp: Promise<Response>;
    switch (policy) {
      case 'NETWORK_ONLY':
        resp = this.responseFromNetwork(req1, cacheName, false);
        break;
      case 'CACHE_FIRST':
      case 'CACHE_ONLY':
        resp = this.responseFromCache(req1, cacheName).catch(() =>
          this.responseFromNetwork(request, cacheName)
        );
        break;
      case 'CACHE_AND_UPDATE':
        resp = this.responseFromCache(req1, cacheName);
        this.responseFromNetwork(request, cacheName);
        break;
      default:
        resp = this.responseFromNetwork(req1, cacheName).catch(() =>
          this.responseFromCache(request, cacheName)
        );
        break;
    }
    return resp;
  }

  async responseFromNetwork(request: Request, cache: string, putInCache = true) {
    const cache1 = await caches.open(cache + '-v' + this.options.version);
    const response = await fetch(request);
    if (putInCache) {
      const url = new URL(request.url);
      if (url.protocol === 'http' || url.protocol === 'https') {
        cache1.put(request, response.clone());
      } else {
        console.warn(`Can not put url ${url} in cache`);
      }
    }
    return response;
  }

  async responseFromCache(request: Request, cache: string) {
    const cache1 = await caches.open(cache + '-v' + this.options.version);
    const resp = await cache1.match(request);
    if (resp) return resp;
    else throw Error('Cache not found for ' + request.url);
  }

  createRequest(url: string | Request, data = { method: 'GET' }) {
    return new Request(url, data);
  }

  findRegex<T>(url: string, regexObject: { [k: string]: T }, elseObject: T): T;
  findRegex<T>(url: string, regexObject: { [k: string]: T }): T | undefined;
  findRegex<T>(url: string, regexObject: { [k: string]: T }, elseObject?: T): T | undefined {
    for (const [key, value] of Object.entries(regexObject)) {
      const regex = new RegExp(key);
      if (regex.test(url)) return value;
    }
    return elseObject;
  }
}

export default ServiceWorker;
