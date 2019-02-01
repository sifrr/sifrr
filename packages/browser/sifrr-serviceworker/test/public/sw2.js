const SW = require('../../src/sifrr.serviceworker');

const sw = new SW({
  version: 2,
  fallbackCacheName: 'ffff'
});

sw.setup();
self.addEventListener('message', async (e) => {
  if (e.data === 'coverage') {
    e.ports[0].postMessage(self.__coverage__);
  } else if (e.data === 'caches') {
    e.ports[0].postMessage(await caches.keys());
  }
});
module.exports = sw;
