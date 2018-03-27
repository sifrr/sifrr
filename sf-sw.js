const CACHE_VERSION = '0';
const POLICIES = {
  '^https://framework.aadityataparia.com': {type: 'NETWORK_FIRST', cache: 'main'},
  'default': {type: 'CACHE_FIRST', cache: 'other'}
}

const FALLBACK_CACHE = 'fallbacks';
const FALLBACKS = {
  '.jpg$': 'https://pbs.twimg.com/profile_images/54789364/JPG-logo-highres_400x400.jpg',
  'default': 'https://framework.aadityataparia.com/index.html'
}

const PRECACHE_URLS = [
  'https://framework.aadityataparia.com/sf-component.js',
  'https://framework.aadityataparia.com/sf-api.js'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // replace sw ASAP
  event.waitUntil(precache(PRECACHE_URLS, FALLBACKS));
});

self.addEventListener('activate', event => {
  let currentCaches = [FALLBACK_CACHE + '-v' + CACHE_VERSION];
  for (let [key, value] of Object.entries(POLICIES)) {
    currentCaches.push(value.cache + '-v' + CACHE_VERSION);
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
  let otherReq = request.clone();
  if (request.method === 'GET') {
    const url = request.url;
    event.respondWith(respondWithPolicy(request).catch(rsn => respondWithFallback(otherReq)));
  }
});

function findRegex(url, obj){
  for (let [key, value] of Object.entries(obj)) {
    const regex = new RegExp(key);
    if (url.match(regex)) return value;
  }
  return obj['default'];
}

function respondWithPolicy(request){
  let new_request = request.clone();
  ({type, cache} = findRegex(request.url, POLICIES) || {type: 'default', cache: 'extra'});
  switch(type){
    case 'NETWORK_ONLY':
      return fromNetwork(new_request, cache);
    case 'CACHE_ONLY':
      return fromCache(new_request, cache);
    case 'CACHE_FIRST':
      return fromCache(new_request, cache).catch(rsn => fromNetwork(request, cache));
    case 'NETWORK_FIRST':
      return fromNetwork(new_request, cache).catch(rsn => fromCache(request, cache));
    default:
      return fromNetwork(new_request, cache).catch(rsn => fromCache(request, cache));
  }
}

function respondWithFallback(request){
  const fallback = findRegex(request.url, FALLBACKS);
  const fb = new Request(fallback);
  return fromCache(fb, FALLBACK_CACHE);
}

function requestFromURL(url) {
  return new Request(url, {method: 'GET'});
}

function precache(urls, fbs) {
  let promises = [];
  urls.forEach(u => {
    let req = requestFromURL(u);
    return promises.push(fromNetwork(req, findRegex(u, POLICIES).cache));
  });
  for (let [key, value] of Object.entries(fbs)) {
    let req = requestFromURL(value);
    promises.push(fromNetwork(req, FALLBACK_CACHE));
  }
  return Promise.all(promises);
}

function fromCache(request, cache) {
  return caches.open(cache + '-v' + CACHE_VERSION).then(cache => cache.match(request)).then(resp => {
    if (resp) return resp;
    else throw "Cache not found for " + request.url;
  });
}

function fromNetwork(request, cache) {
  return caches.open(cache + '-v' + CACHE_VERSION).then(cache => fetch(request).then(response => cache.put(request, response.clone()).then(() => response)));
}