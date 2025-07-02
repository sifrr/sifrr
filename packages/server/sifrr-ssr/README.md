# sifrr-ssr · [![npm version](https://img.shields.io/npm/v/@sifrr/ssr.svg)](https://www.npmjs.com/package/@sifrr/ssr) [![Doscify](https://img.shields.io/badge/API%20docs-Docsify-red.svg)](https://sifrr.github.io/sifrr/#/./packages/server/sifrr-ssr/)

Server Side Pre-Redering for any js based app using puppeteer (headless chrome) with caching.

## Features

- Works with Custom Elements, Shadow DOM
- Add custom JS to execute before or after rendering
- key based Caching

## How to use

Do `npm i @sifrr/ssr` or `yarn add @sifrr/ssr` or add the package to your `package.json` file.

## Api

### Basic usage

SifrrSsr listens for `load` page event and waits for any `fetch`, `xhr` request to complete before returning rendered HTML. It doesn't load any media content on server.

```js
const SifrrSsr = require('@sifrr/ssr');

// options
// `cacheStore`: same as store in [node-cache-manager](https://github.com/BryanDonovan/node-cache-manager) options, default: memory store with 100MB storage
// `maxCacheSize`: Maximum in-memory cache size (in MegaBytes)
// `ttl`: time to live for a cache request (in Seconds) 0 means infinity
// `cacheKey`: function that returns cache key for given req object
// `fullUrl`: function for middleware to determine fullUrl of express request
// `beforeRender`: this function will be executed in browser before rendering, doesn't take any arguments
// `afterRender`: this function will be executed in browser after rendering, doesn't take any arguments
// `filterOutgoingRequests`: This function is executed for every outgoing request in sifrr renderer, if this return false request will be blocked, else it will be allowed
//
// default values
const options = {
  userAgents: [/.*/],
  cache: new Keyv(), // Keyv cache store
  maxCacheSize: 100,
  ttl: 0,
  cacheKey: (url, headers) => url,
  beforeRender: () => {},
  afterRender: () => {},
  shouldRender: (url, headers) => true,
  filterOutgoingRequests: (url) => true
  puppeteerOptions: {} // puppeteer launch options
}

const sifrrSsr = new SifrrSsr(options);
// By default it matches all user agents

// add middleware to any connect/express like server
// for example in express:
const express = require('express');
const server = express();

// Only use for GET requests as a express middleware
server.get(async (req, res, next) => {
  const url = req.protocol + '://' + req.get('host') + req.originalUrl;
  try {
    const rendered = await seo.render(url, req.headers);
    if (rendered) { // rendered is null if returned page was not html, or shouldRender is false
      console.log('Rendered middleware ', url, rendered);
      res.set('content-type', 'text/html');
      res.set('x-ssr-powered-by', '@sifrr/ssr');
      res.send(rendered);
    } else {
      next();
    }
  } catch (e) {
    console.error(e);
    next();
  }
});
server.listen(8080);

// Use it programatically - Only renders get urls
// these url, headers are passed to other functions
sifrrSsr.render(
  url, /* Full url of page to render with protocol, domain, port, etc. */,
  headers = {
    /* Headers to send with GET request */
  }
).then(html => ...).catch((e) => {
  // It won't render the page if [rendering logic](#rendering-logic) is not satisfied and will throw error.
  // e.message === 'No Render' when it doesn't render
});
```

[node-cache-manager](https://github.com/BryanDonovan/node-cache-manager) supports a lot of stores: [list](https://github.com/BryanDonovan/node-cache-manager#store-engines).

### Rendering logic

sifrr-ssr only renders a request if it has no `Referer` header (i.e. direct browser requests) and if `shouldRender` returns `true` and if content-type is `html`.

#### Changing shouldRender()

Change `sifrrSsr.shouldRender`, by default it returns `this._isUserAgent(headers)` ([details](#isUserAgent)). eg:

```js
sifrrSsr.shouldRender = (url, headers) => {
  // req is request argument given by server (express/connect)
  // return true to render it server-side, return false to not render it.
  return this.isUserAgent(req) && req.fullUrl.indexOf('html') >= 0;
};
```

### Clearing cache

By default, server side rendered html is cached till you restart the server or if you close the browser. You can manually clear cache using

```js
sifrrSsr.clearCache();
```

### Higher level API

#### render()

returns `Promise` which resolves in server rendered `html` if url response has content-type html, else resolves in `false`.

```js
sifrrSsr.render(
  url, /* Full url of page to render with protocol, domain, port, etc. */,
  headers = {
    /* Headers to send with GET request */
  }
);
```

#### close()

closes puppeteer browser instance

```js
sifrrSsr.close();
```

#### puppeteerOptions

return options that will be used to launch puppeteer instance.

```js
sifrrSsr.puppeteerOptions;
```

**Note**: Note that first server render will be slow (depending on server machine), but subsequent requests will be really fast because of caching (depending on efficiency of cache key).

## Tips

- Don't use external scripts in pages without a good cache age.

- Pre-render a bunch of urls

```js
const fs = require('fs');
const joinPath = require('path').join;

const seo = new SifrrSsr();

async function renderUrls(
  urls = [
    /* array of urls */
  ],
  path = (url) => url
) {
  for (let i = 0; i < urls.length; i++) {
    const html = await seo.render(urls[i]);
    await new Promise((res, rej) =>
      fs.writeFile(path(urls[i]), html, (err) => {
        if (err) rej(err);
        res('The file has been saved!');
      })
    );
  }
  await seo.close();
}

renderUrls(['http://localhost:8080/abcd', 'http://localhost:8080/whatever'], (u) =>
  joinPath(__dirname, '.' + u.slice(21))
);
```
