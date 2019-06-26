const Cache = require('cache-manager');

module.exports = ops => {
  ops = Object.assign(
    {
      cacheStore: 'memory',
      maxCacheSize: 100, // in MB
      ttl: 0 // in Seconds
    },
    ops
  );

  return Cache.caching({
    store: ops.cacheStore,
    ttl: ops.ttl,
    length: (val, key) => {
      return Buffer.from(key + key + val).length + 2;
    },
    max: ops.maxCacheSize * 1000000
  });
};
