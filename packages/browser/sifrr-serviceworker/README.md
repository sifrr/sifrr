# sifrr-sw

Customizable Service Worker.

### Size
| Type | Size     |
| :------------ | :------------: |
| Normal (`dist/sifrr.serviceworker.js`)       | [![Normal](https://img.badgesize.io/sifrr/sifrr/master/packages/browser/sifrr-serviceworker/dist/sifrr.serviceworker.js?maxAge=600)](https://github.com/sifrr/sifrr/blob/master/packages/browser/sifrr-serviceworker/dist/sifrr.serviceworker.js) |
| Minified (`dist/sifrr.serviceworker.min.js`) | [![Minified](https://img.badgesize.io/sifrr/sifrr/master/packages/browser/sifrr-serviceworker/dist/sifrr.serviceworker.min.js?maxAge=600)](https://github.com/sifrr/sifrr/blob/master/packages/browser/sifrr-serviceworker/dist/sifrr.serviceworker.min.js) |
| Minified + Gzipped (`dist/sifrr.serviceworker.min.js`) | [![Minified + Gzipped](https://img.badgesize.io/sifrr/sifrr/master/packages/browser/sifrr-serviceworker/dist/sifrr.serviceworker.min.js?compression=gzip&maxAge=600)](https://github.com/sifrr/sifrr/blob/master/packages/browser/sifrr-serviceworker/dist/sifrr.serviceworker.min.js) |

## How to use
### Directly in Browser using standalone distribution
Copy contents of `sifrr.serviceworker.min.js` or `sifrr.serviceworker.js` in your serviceworker file.
And add this at the end of file.
```js
new Sifrr.Serviceworker(/* config */).setup();
```

### Using npm
Do `npm i @sifrr/storage` or `yarn add @sifrr/storage` or add the package to your `package.json` file.

example of `sw.js` to be bundled (using webpack or rollup or any other bundler):
#### Commonjs
```js
const SW = require('@sifrr/serviceworker');
module.exports = new SW(/* config */).setup();
```

#### ES modules
```js
import SW from '@sifrr/serviceworker'
export default new SW(/* config */).setup();
```

## Config
Default config:
```js
let config = {
  version: 1,
  fallbackCacheName: 'fallbacks',
  defaultCacheName: 'default',
  policies: {
    'default': {
      policy: 'NETWORK_FIRST',
      cacheName: 'default'
    }
  },
  fallbacks: {
    'default': '/offline.html'
  },
  precacheUrls: []
}
```

- __version__: `integer` Version of service worker, when you change service worker version old versions' caches will be deleted. All caches are suffixed with `-v${version}`.
- __fallbackCacheName__: `string` Name of cache storage for fallbacks.
- __defaultCacheName__: `string` Default name of cache storage to be used.
- __policies__:
```js
{
  'regex string': {
    policy: 'Name of policy', // default: 'NETWORK_FIRST'
    cacheName: 'Name of cache storage' // default: options.defaultCacheName
  }
}
```
When a request is sent, if the url matches the regex string then it will be fetched using `policy` and storaged in `cacheName` cache storage. The policy with 'default' will be used for urls not matching any regex.
**Note**: Even though regex string is treated as regex, it should be given as a string, eg. `'*.js'`
- __fallbacks__: `{ 'regex string': 'file url' }` If request's url matches regex string (same as policies), then fallback for that url will be file from `file url` if request is not completed due to no connection, not found, etc. 'default' fallback will be used if no regex matches the url given.
- __precacheUrls__: `array of string` Urls to be precached.

### Policies
- `NETWORK_ONLY`: Only resolve request from network.
- `NETWORK_FIRST`: Try to resolve request from network, if fails then resolve from cache.
- `CACHE_ONLY`: Only to resolve request from cache.
- `CACHE_FIRST`: Try to resolve request from cache, if fails then resolve from network.
