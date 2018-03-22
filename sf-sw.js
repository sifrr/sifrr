const POLICY = {
  '^https://framework.aadityataparia.com': {type: 'NETWORK_FIRST', cache: 'main-v1'},
  '.*': {type: 'CACHE_FIRST', cache: 'other-v1'}
}

const PRECACHE_URLS = [
  './sf-component.js',
  './sf-api.js'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // replace sw ASAP
  event.waitUntil(precache(PRECACHE_URLS));
});

self.addEventListener('activate', event => {
  let currentCaches = ['extra'];
  for (let [key, value] of Object.entries(POLICY)) {
    currentCaches.push(value.cache);
  }
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
    event.respondWith(respondWithPolicy(request, findPolicy(url)));
  }
});

function findPolicy(url){
  for (let [key, value] of Object.entries(POLICY)) {
    const regex = new RegExp(key);
    if (url.match(regex)) return value;
  }
  return {type: 'DEFAULT', cache: 'extra'}
}

function respondWithPolicy(request, {type, cache}){
  let new_request = request.clone();
  switch(type){
    case 'NETWORK_ONLY':
      return fromNetwork(new_request, cache);
    case 'CACHE_ONLY':
      return fromCache(new_request, cache);
    case 'CACHE_FIRST':
      return fromCache(new_request, cache).then(resp => {
        if (resp) return resp;
        else return fromNetwork(request, cache);
      });
    case 'NETWORK_FIRST':
      return fromNetwork(new_request, cache).catch(rsn => fromCache(request, cache));
    default:
      return fromNetwork(new_request, cache).catch(rsn => fromCache(request, cache));
  }
}

function requestFromURL(url) {
  return new Request(url, {method: 'GET'});
}

function precache(urls) {
  urls.forEach(u => {
    let req = requestFromURL(u);
    return fromNetwork(req, findPolicy(u).cache);
  });
}

function fromCache(request, cache) {
  return caches.open(cache).then(cache => cache.match(request));
}

function fromNetwork(request, cache) {
  return caches.open(cache).then(cache => fetch(request).then(response => cache.put(request, response.clone()).then(() => response)));
}