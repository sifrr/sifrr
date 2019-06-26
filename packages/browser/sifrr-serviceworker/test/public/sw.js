const SW = require('../../src/sifrr.serviceworker');

const sw = new SW({
  version: 1,
  fallbackCacheName: 'ffff',
  defaultCacheName: 'dddd',
  policies: {
    cachefirst: {
      policy: 'CACHE_FIRST'
    },
    networkfirst: {
      policy: 'NETWORK_FIRST',
      cacheName: 'bangbang'
    },
    networkonly: {
      policy: 'NETWORK_ONLY'
    },
    server: {
      policy: 'NETWORK_ONLY'
    },
    cacheonly: {
      policy: 'CACHE_ONLY',
      cacheName: 'bangbang2'
    },
    cacheupdate: {
      policy: 'CACHE_AND_UPDATE'
    },
    precache: {
      policy: 'CACHE_ONLY',
      cacheName: 'bangbang2'
    }
  },
  fallbacks: {
    status404: '/offline.html'
  },
  precacheUrls: ['/precache.js', '/cacheonly.js']
});

sw.setup();
sw.onInstall = () => {
  self.skipWaiting();
};
sw.setupPushNotification('default title', { body: 'default body' });
sw.onNotificationClick = event => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({
        type: 'window'
      })
      .then(function(clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          const url = new URL(client.url);
          if (url.pathname == '/' && 'focus' in client) return client.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow('/');
      })
  );
};
self.addEventListener('message', async e => {
  if (e.data === 'coverage') {
    e.ports[0].postMessage(self.__coverage__);
  } else if (e.data === 'caches') {
    e.ports[0].postMessage(await caches.keys());
  } else if (e.data.type && e.data.type === 'push') {
    sw.pushEventListener(e.data.event).then(() => e.ports[0].postMessage('ok'));
  }
});
module.exports = sw;
