const SW = require('../../dist/sifrr.serviceworker');
const sw = new SW({
  version: 2,
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
});

sw.setup();
sw.setupPushNotification('default title', { body: 'default body' });
module.exports = sw;
