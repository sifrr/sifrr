# sifrr-seo · [![npm version](https://img.shields.io/npm/v/@sifrr/seo.svg)](https://www.npmjs.com/package/@sifrr/seo)

Middleware to serve js rendered html to crawler bots using puppeteer with caching, i.e. Server side rendering for any js based webapp.

## How to use

Do `npm i @sifrr/fetch` or `yarn add @sifrr/fetch` or add the package to your `package.json` file.

### Api

#### Basic usage

```js
const SifrrSeo = require('@sifrr/seo');
const sifrrSeo = new SifrrSeo(/* Array of user agents to render for */);
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
server.use(sifrrSeo.middleware);
server.listen(8080);
```

#### Adding your custom rendering logic

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

__Note__: Note that first server rendered will be slow, but subsequent requests will be really fast because of caching.
