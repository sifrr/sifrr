const CACHE_VERSION = '0';
const POLICIES = {
  'default': {
    type: 'NETWORK_FIRST',
    cache: 'other'
  }
};

const FALLBACK_CACHE = 'fallbacks';
const FALLBACKS = {
  'default': './index.html'
};

const PRECACHE_URLS = [];

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
  }).then(() => self.clients.claim());
}); // remove old caches versions and add new ones

self.addEventListener('fetch', event => {
  let request = event.request;
  let otherReq = request.clone();
  let oreq = request.clone();
  if (request.method === 'GET') {
    event.respondWith(respondWithPolicy(request).then(response => {
      if (!response.ok && response.status > 0 && findRegex(oreq.url, FALLBACKS)) {
        throw Error('response status ' + response.status);
      }
      return response;
    }).catch(rsn => respondWithFallback(otherReq)));
  }
});

function findRegex (url, obj) {
  for (let [key, value] of Object.entries(obj)) {
    const regex = new RegExp(key);
    if (url.match(regex)) return value;
  }
  return obj['default'];
}

function respondWithPolicy (request) {
  let new_request = request.clone();
  const { type, cache } = findRegex(request.url, POLICIES) || {
    type: 'default',
    cache: 'extra'
  };
  let resp;
  switch (type) {
  case 'NETWORK_ONLY':
    resp = fromNetwork(new_request, cache);
    break;
  case 'CACHE_ONLY':
    resp = fromCache(new_request, cache);
    break;
  case 'CACHE_FIRST':
    resp = fromCache(new_request, cache).catch(() => fromNetwork(request, cache));
    break;
  case 'NETWORK_FIRST':
    resp = fromNetwork(new_request, cache).catch(() => fromCache(request, cache));
    break;
  default:
    resp = fromNetwork(new_request, cache).catch(() => fromCache(request, cache));
    break;
  }
  return resp;
}

function respondWithFallback (request) {
  const fallback = findRegex(request.url, FALLBACKS);
  const fb = new Request(fallback);
  return fromCache(fb, FALLBACK_CACHE);
}

function requestFromURL (url) {
  return new Request(url, {
    method: 'GET'
  });
}

function precache (urls, fbs) {
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

function fromCache (request, cache) {
  fromNetwork(request.clone(), cache);
  return caches.open(cache + '-v' + CACHE_VERSION).then(cache => cache.match(request)).then(resp => {
    if (resp) return resp;
    else throw 'Cache not found for ' + request.url;
  });
}

function fromNetwork (request, cache) {
  return caches.open(cache + '-v' + CACHE_VERSION).then(cache => fetch(request).then(response => cache.put(request, response.clone()).then(() => response)));
}
