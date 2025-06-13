import SW from './index.mjs';

const sw = new SW({
  version: 2,
  fallbackCacheName: 'ffff',
  fallbacks: {
    networkonly: '/offline.html'
  }
});

sw.setup();
sw.onInstall = () => {
  self.skipWaiting();
};
sw.setupPushNotification();
self.addEventListener('message', async (e) => {
  if (e.data === 'coverage') {
    e.ports[0].postMessage(self.__coverage__);
  } else if (e.data === 'caches') {
    e.ports[0].postMessage(await caches.keys());
  } else if (e.data.type && e.data.type === 'push') {
    sw.pushEventListener(e.data.event);
  }
});
