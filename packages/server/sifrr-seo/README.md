# sifrr-seo · [![npm version](https://img.shields.io/npm/v/@sifrr/seo.svg)](https://www.npmjs.com/package/@sifrr/seo)

Server Side Redering for any js based app as a express middleware.

## How to use

Do `npm i @sifrr/seo` or `yarn add @sifrr/seo` or add the package to your `package.json` file.

### Api

#### Basic usage

```js
const SifrrSeo = require('@sifrr/seo');

// options
// `localport`: local server port on which you are listening (will be used to get full url for puppeteer)
// `cache`: Cache to use (should be a node-cache-manager instance)
// `maxCacheSize`: Maximum in-memory cache size
// `ttl`: time to live for a cache request
// `cacheKey`: function that returns cache key for given req object
// `onRender`: this function will be executer in browser after rendering
//
// default values
const options = {
  localport: 80,
  cache: require('cache-manager').caching, // default in memory caching
  maxCacheSize: 100, // (in MegaBytes)
  ttl: 0, // (in Seconds) 0 means infinity
  cacheKey: (req) => this.fullUrl(req),
  onRender: () => {}
}

const sifrrSeo = new SifrrSeo(/* Array of user agents to render for */, options);
// By default array is made up of these crawl bot user agents:
// 'Googlebot', // Google
// 'Bingbot', // Bing
// 'Slurp', // Slurp
// 'DuckDuckBot', // DuckDuckGo
// 'Baiduspider', //Baidu
// 'YandexBot', // Yandex
// 'Sogou', // Sogou
// 'Exabot', // Exalead

// Add your own user agent for which you want to server render
// You can give sub string of regex string like '(Google|Microsoft).*'
sifrrSeo.addUserAgent(/* string */ 'Opera Mini');

// add middleware to any connect/express like server
// for example in express:
const express = require('express');
const server = express();

// Only use for GET requests
server.get(sifrrSeo.middleware);
server.listen(8080);
```

[node-cache-manager](https://github.com/BryanDonovan/node-cache-manager) supports a lot of stores: [list](https://github.com/BryanDonovan/node-cache-manager#store-engines).

#### Adding your custom rendering logic

- sifrr-seo only renders a request if it has no `Referer` header (i.e. direct browser requests) and if `shouldRender` returns `true` and if content-type is `html`.

Change `sifrrSeo.shouldRender`, by default it is `sifrrSeo.isUserAgent(req)`. eg:

```js
sifrrSeo.shouldRender = (req) => {
  // req is request argument given by server (express/connect)
  // return true to render it server-side, return false to not render it.
  return this.isUserAgent(req) && req.url.indexOf('html') >= 0
}
```

- `sifrrSeo.isUserAgent(req)` returns `true` if req's user agent is in seo userAgents, else returns `false`.

#### Clearing cache

By default, server side rendered html is cached till you restart the server or if you close the browser. You can manually clear cache using

```js
sifrrSeo.clearCache();
```

### Higher level API

#### render()
returns `Promise` which resolves in server rendered `html` if url response has content-type html, else resolves in `false`.
```js
sifrrSeo.render(url);
```

#### close()
closes puppeteer browser instance
```js
sifrrSeo.close();
```

#### addPuppeteerOption()
adds puppeteer launch option. see list of options [here](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions).
```js
sifrrSeo.addPuppeteerOption('headless', false);
```

#### puppeteerOptions
return options that will be used to launch puppeteer instance.
```js
sifrrSeo.puppeteerOptions;
```

__Note__: Note that first server render will be slow, but subsequent requests will be really fast because of caching.
