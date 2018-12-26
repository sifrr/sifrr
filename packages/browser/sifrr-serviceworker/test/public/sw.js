const SW = require('../../dist/sifrr.serviceworker');
module.exports = new SW({
  version: 1,
  fallbackCacheName: 'ffff',
  defaultCacheName: 'dddd',
  policies: {
    'cachefirst': {
      policy: 'CACHE_FIRST'
    },
    'networkfirst': {
      policy: 'NETWORK_FIRST',
      cacheName: 'bangbang'
    },
    'networkonly': {
      policy: 'NETWORK_ONLY'
    },
    'cacheonly': {
      policy: 'CACHE_ONLY',
      cacheName: 'bangbang2'
    },
  },
  fallbacks: {
    'default': '/404.html'
  },
  precache_urls: ['/precache.js', './cacheonly.js']
}).setup();
