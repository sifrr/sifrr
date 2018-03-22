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
    event.respondWith(fromNetwork(new_request).catch(rsn => fromCache(request)));
  }
});

function requestFromURL(url) {
  return new Request(url, {method: 'GET'});
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
  return cache = caches.open(CACHE).then(cache => cache.match(request));
}

function fromNetwork(request) {
  return fetch(request).then(response => {
    let rsp = response.clone();
    caches.open(CACHE).then(cache => cache.put(request, rsp));
    return response;
  });
}