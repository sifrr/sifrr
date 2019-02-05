# sifrr-seo · [![npm version](https://img.shields.io/npm/v/@sifrr/seo.svg)](https://www.npmjs.com/package/@sifrr/seo)

Server Side Redering for any js based app using puppeteer (headless chrome) with caching.

## How to use

Do `npm i @sifrr/seo` or `yarn add @sifrr/seo` or add the package to your `package.json` file.

## Api

### Basic usage

SifrrSeo listens for `load` page event and waits for any `fetch`, `xhr` request to complete before returning rendered HTML. It doesn't load any media content on server.

```js
const SifrrSeo = require('@sifrr/seo');

// options
// `cacheStore`: same as store in [node-cache-manager](https://github.com/BryanDonovan/node-cache-manager) options
// `maxCacheSize`: Maximum in-memory cache size (in MegaBytes)
// `ttl`: time to live for a cache request (in Seconds) 0 means infinity
// `cacheKey`: function that returns cache key for given req object
// `fullUrl`: function for middleware to determine fullUrl of express request
// `beforeRender`: this function will be executed in browser before rendering, doesn't take any arguments
// `afterRender`: this function will be executed in browser after rendering, doesn't take any arguments
//
// default values
const options = {
  cacheStore: 'memory', // default in memory caching
  maxCacheSize: 100,
  ttl: 0,
  cacheKey: (req) => req.fullUrl,
  fullUrl: expressReq => `http://127.0.0.1:80${expressReq.originalUrl}`
  beforeRender: () => {},
  afterRender: () => {}
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

// Only use for GET requests as a express middleware
server.get(sifrrSeo.middleware);
server.listen(8080);

// Use it programatically - Only renders get requets
sifrrSeo.render({
  fullUrl: /* Full url of page to render with protocol, domain, port, etc. */,
  headers: {
    /* Headers to send with GET request */
  }
}).then(html => ...).catch((e) => {
  // It won't render the page if [rendering logic](#rendering-logic) is not satisfied and will throw error.
  // e.message === 'No Render' when it doesn't render
});
```

[node-cache-manager](https://github.com/BryanDonovan/node-cache-manager) supports a lot of stores: [list](https://github.com/BryanDonovan/node-cache-manager#store-engines).

### Rendering logic

sifrr-seo only renders a request if it has no `Referer` header (i.e. direct browser requests) and if `shouldRender` returns `true` and if content-type is `html`.

#### Changing shouldRender()

Change `sifrrSeo.shouldRender`, by default it returns `this.isUserAgent(req)` ([details](#isUserAgent)). eg:

```js
sifrrSeo.shouldRender = (req) => {
  // req is request argument given by server (express/connect)
  // return true to render it server-side, return false to not render it.
  return this.isUserAgent(req) && req.url.indexOf('html') >= 0
}
```

### Clearing cache

By default, server side rendered html is cached till you restart the server or if you close the browser. You can manually clear cache using

```js
sifrrSeo.clearCache();
```

### Higher level API

#### render()

returns `Promise` which resolves in server rendered `html` if url response has content-type html, else resolves in `false`.

```js
sifrrSeo.render({
  fullUrl: /* Full url of page to render with protocol, domain, port, etc. */,
  headers: {
    /* Headers to send with GET request */
  }
});
```

#### isUserAgent()

Returns true if req.headers['user-agent'] matches any of user-agents given in initialization

#### close()

closes puppeteer browser instance

```js
sifrrSeo.close();
```

#### addPuppeteerOption()

adds puppeteer launch option. see list of options [here](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions).

Example: `sifrrSeo.addPuppeteerOption('headless', false)` to run it without headless mode

```js
sifrrSeo.addPuppeteerOption('headless', false);
```

#### puppeteerOptions

return options that will be used to launch puppeteer instance.

```js
sifrrSeo.puppeteerOptions;
```

**Note**: Note that first server render will be slow (depending on server machine), but subsequent requests will be really fast because of caching.

## Tips

-   Don't use external scripts in pages without a good cache age.

-   How to use with sifrr-dom:

    -   Add web components (shadowdom v1 spec) polyfills from [here](https://github.com/webcomponents/webcomponentsjs). Needs [ShadyDOM](https://github.com/webcomponents/shadydom) and [ShadyCSS](https://github.com/webcomponents/shadycss) polyfills.
    -   Change options to force shadyDOM in server render.
    -   Example in [tests](./test/public/server.js)

```js
seoOptions = {
  beforeRender: () => {
    // Force shadyDom (no shadow root)
    ShadyDOM = { force: true };
  },
  afterRender: async () => {
    // Wait till all sifrr elements are loaded
    if (typeof Sifrr === 'undefined' || typeof Sifrr.Dom === 'undefined') return false;
    await Sifrr.Dom.loading();
  }
}
```
