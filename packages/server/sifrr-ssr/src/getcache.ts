import { caching } from 'cache-manager';

export default (ops) => {
  ops = Object.assign(
    {
      cacheStore: 'memory',
      maxCacheSize: 100, // in MB
      ttl: 0 // in Seconds
    },
    ops
  );

  return caching({
    store: ops.cacheStore,
    ttl: ops.ttl,
    length: (val, key) => {
      return Buffer.from(key + key + val).length + 2;
    },
    max: ops.maxCacheSize * 1000000
  });
};
