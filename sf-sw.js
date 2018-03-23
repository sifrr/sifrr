const POLICIES = {
  '^https://framework.aadityataparia.com': {type: 'NETWORK_FIRST', cache: 'main-v1'},
  '.*': {type: 'CACHE_FIRST', cache: 'other-v1'}
}

const FALLBACK_CACHE = 'fallbacks-v1';
const FALLBACKS = {
  '.jpg$': 'https://pbs.twimg.com/profile_images/54789364/JPG-logo-highres_400x400.jpg',
  '.*': 'https://framework.aadityataparia.com/index.html'
}

const PRECACHE_URLS = [
  './sf-component.js',
  './sf-api.js'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // replace sw ASAP
  event.waitUntil(precache(PRECACHE_URLS, FALLBACKS));
});

self.addEventListener('activate', event => {
  let currentCaches = [FALLBACK_CACHE];
  for (let [key, value] of Object.entries(POLICIES)) {
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
  return undefined;
}

function respondWithPolicy(request){
  let new_request = request.clone();
  ({type, cache} = findRegex(request.url, POLICIES) || {type: 'default', cache: 'extra-v1'});
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
  urls.forEach(u => {
    let req = requestFromURL(u);
    return fromNetwork(req, findRegex(u, POLICIES).cache);
  });
  for (let [key, value] of Object.entries(fbs)) {
    let req = requestFromURL(value);
    console.log(value);
    return fromNetwork(req, FALLBACK_CACHE);
  }
}

function fromCache(request, cache) {
  return caches.open(cache).then(cache => cache.match(request)).then(resp => {
    if (resp) return resp;
    else throw Error("Cache not found for " + request.url);
  });
}

function fromNetwork(request, cache) {
  return caches.open(cache).then(cache => fetch(request).then(response => cache.put(request, response.clone()).then(() => response)));
}