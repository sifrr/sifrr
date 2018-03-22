const POLICY = {
  '^https://framework.aadityataparia.com': 'NETWORK_FIRST',
  '.*': 'CACHE_FIRST'
}
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
    const url = request.url;
    for (let [key, value] of Object.entries(POLICY)) {
      const regex = new RegExp(key);
      if (url.match(regex)) return event.respondWith(respondWithPolicy(request, value));
    }
    return event.respondWith(fromNetwork(new_request).catch(rsn => fromCache(request)));
  }
});

function respondWithPolicy(request, policy = 'default'){
  let new_request = request.clone();
  switch(policy){
    case 'NETWORK_ONLY':
      return fromNetwork(new_request);
    case 'CACHE_ONLY':
      return fromCache(new_request);
    case 'CACHE_FIRST':
      const resp = fromCache(new_request);
      if (resp) return resp;
      else return fromNetwork(request);
    default:
      return fromNetwork(new_request).catch(rsn => fromCache(request));
  }
}

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
  return caches.open(CACHE).then(cache => cache.match(request));
}

function fromNetwork(request) {
  return fetch(request).then(response => {
    let rsp = response.clone();
    caches.open(CACHE).then(cache => cache.put(request, rsp));
    return response;
  });
}