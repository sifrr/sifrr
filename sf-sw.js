const CACHE = 'cache-v1';

const PRECACHE_URLS = [
  './sf-component.js',
  './sf-api.js'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // replace sw ASAP
  event.waitUntil(precache(PRECACHE_URLS));
});

self.addEventListener('activate', event => {
  const currentCaches = [CACHE];
  caches.keys().then(cacheNames => {
    return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
  }).then(cachesToDelete => {
    return Promise.all(cachesToDelete.map(cacheToDelete => {
      return caches.delete(cacheToDelete);
    }));
  }).then(() => self.clients.claim())
}); //remove old caches versions

self.addEventListener('fetch', event => {
  let request = event.request;
  if (request.method === 'GET') {
    let new_request = request.clone();
    fromNetwork(new_request, 10).then(rsp => event.respondWith(rsp));
  }
});

function requestFromURL(url) {
  return new Request(url, {method: 'GET'});
}

function replaceUrl(request){
  const oldUrl = request.url;
  let newUrl = '';
  return new Request(newURL, {
    method: request.method,
    headers: request.headers,
    body: body,
    referrer: request.referrer,
    referrerPolicy: request.referrerPolicy,
    mode: request.mode,
    credentials: request.credentials,
    cache: request.cache,
    redirect: request.redirect,
    integrity: request.integrity,
  });
}

function precache(urls) {
  return caches.open(CACHE).then(function (cache) {
    urls.forEach(u => {
      let req = requestFromURL(u);
      return fetch(req).then(rsp => cache.put(req, rsp.clone()));
    });
  });
}

function fromCache(request, from = null) {
  const cache = caches.open(CACHE).then(cache => cache.match(request));
  if (!cache && !from) {
    let rsp;
    console.log('trying network');
    fromNetwork(request).then(resp => rsp = resp);
    return rsp;
  } else if (cache){
    return cache;
  } else {
    return fallback(request);
  }
}

function fromNetwork(request, timeout) {
  return new Promise(function (fulfill) {
    let timeoutId = setTimeout(() => fulfill(fromCache(request, 'network')), timeout);
    fetch(request).then(response => {
      let rsp = response.clone();
      clearTimeout(timeoutId);
      fulfill(response);
      caches.open(CACHE).then(cache => cache.put(request, rsp));
    }).catch(() => fulfill(fromCache(request, 'network')));
  });
}