# sifrr-fetch · [![npm version](https://img.shields.io/npm/v/@sifrr/fetch.svg)](https://www.npmjs.com/package/@sifrr/fetch) [![Doscify](https://img.shields.io/badge/API%20docs-Docsify-red.svg)](https://sifrr.github.io/sifrr/#/./packages/browser/sifrr-fetch/)

> Fetch API and websockets API based small, easy to use, promise based requests library for browsers.

## Size

| Type                                           |                           Size                           |
| :--------------------------------------------- | :------------------------------------------------------: |
| Minified (`dist/sifrr.fetch.min.js`)           |  ![](https://badgen.net/bundlephobia/min/@sifrr/fetch)   |
| Minified + Gzipped (`dist/sifrr.fetch.min.js`) | ![](https://badgen.net/bundlephobia/minzip/@sifrr/fetch) |

## How to use

### Directly in Browser using standalone distribution

Add script tag in your website.

```html
<script src="https://unpkg.com/@sifrr/fetch@{version}/dist/sifrr.fetch.min.js"></script>
```

#### Browser API support needed for

| APIs         | caniuse                              | polyfills                                     |
| :----------- | :----------------------------------- | :-------------------------------------------- |
| Fetch API    | <https://caniuse.com/#feat=fetch>    | <https://github.com/github/fetch>             |
| Promises API | <https://caniuse.com/#feat=promises> | <https://github.com/stefanpenner/es6-promise> |

### Using npm

Do `npm i @sifrr/fetch` or `yarn add @sifrr/fetch` or add the package to your `package.json` file.

example, put in your frontend js module (compatible with webpack/rollup/etc):

#### Commonjs

```js
window.Sifrr = window.Sifrr || {};
window.Sifrr.Fetch = require('@sifrr/fetch');
```

#### ES modules

```js
import { sFetch, Fetch, Socket } from '@sifrr/fetch';
// and use as Sifrr.Fetch.Fetch or Sifrr.Fetch.Socket
// sFetch is default instance of Fetch
```

#### With node

```js
// set global.fetch
const { Fetch } = require('@sifrr/fetch');
// set global.WebSocket
global.WebSocket = require('isomorphic-ws');
const { Socket } = require('@sifrr/fetch');
```

## API

### HTTP Requests

**options** are Fetch API options with some extra keys:

- **baseUrl** baseUrl of api
- **params** `json object` key, value pairs will be added to url as query params
- **body** `json object | string` body to send with post requests
- **onProgress** `function` if response has content-length, this function will be called with

```js
{
  loaded, // loaded bytes
  total, // total bytes (0 if response doesn't have content length)
  percent, // progress precentage
  speed, // speed in kbps
  value,
  ... // chunk value
}
```

- **timeout** `time in ms` timeout for request
- **before** `function` this function will be called with `{ url, options, method }` and should return modified `{ url, options, method }` which will be used to send requests
- **after** `function` this function will be called with `response` and should return modified `response`
- **use** `function` this function will be called with `{ url, options, method }` and resolve/return with response which will be returned, if this function errors, response will be fetched normally (use case: use it as a middleware for cache)

### Response

response returned by api calls contains

- **status** - status code of response
- **response** - original response instance from fetch api
- **data** - if response has `content-type: application/json` header, it is data received from `resp.json()`
- **ok** - fetch response.ok property

#### GET request

you can add query parameters to get request options.

```js
options.query = { key: 'value' };
Sifrr.Fetch.sFetch.get(url, options)
  .then({ data, status, response, ok } => {

  })
  .catch(e => {
    // handle any network error
    // Note that promise doesn;t
  });
```

#### PUT request

```js
Sifrr.Fetch.sFetch.put(url, body, options).then((response) => {
  // response is JSON if response has `content-type: application/json` header
  // else it is a Fetch API response object.
});
```

#### POST request

you can add post request body parameters to post request options.

```js
options.body = { key: 'value' };
options.headers = {
  'content-type': 'aaplication/json'
};
Sifrr.Fetch.sFetch.post(url, options).then((response) => {
  // response is JSON if response has `content-type: application/json` header
  // else it is a Fetch API response object.
});
```

#### DELETE request

```js
Sifrr.Fetch.sFetch.delete(url, options).then((response) => {
  // response is JSON if response has `content-type: application/json` header
  // else it is a Fetch API response object.
});
```

#### Cache as Middleware

```js
const storage = new Sifrr.Storage();
function cacheOrGet(url) {
  Sifrr.Fetch.sFetch.get(url, {
    use: (url) =>
      storage.get(url).then((v) => (typeof v[url] === 'undefined' ? throw 'Not found' : v[url])),
    after: (response) => {
      storage.set(url, response);
      return response;
    }
  });
}
```

## Create new Instance with options

```js
const fetch = new Sifrr.Fetch(options);

// then use
fetch.get;
fetch.put;
fetch.post;
fetch.delete;
fetch.graphql;
```

## WebSockets

Websocket with Automatic connection retries

### Open a web socket

```js
// Open a socket
const socket = new Sifrr.Fetch.Socket(url, protocols, {
  reconnect: boolean // should it reconnect automatically on close
  reconnectInterval: number // retry after milliseconds
});
```

### Send Message

```js
// send a message
socket.send(message);
```

### WebSocket fetch

```js

// send a message
socket.fetch(message [, type, timeout]).then(resp => {
  // do something
});

// Server will receive data as:
// {
//   id: Int,
//   type: type, (default: 'sifrr-fetch')
//   payload: message
// },
// and should send back
// {
//   id: same id as received
//   payload: response
// }
// then resp will be equal to response sent above
//
// If socket connection fails or it doesn't receive response after timeout
// Promise will reject
```

### Hooks

```js
// same as websocket's hooks
socket.onmessage = (event) => {};
socker.onopen = () => {};
socker.onclose = () => {};
socker.onerror = (e) => {};
// called when websocket is reconnecting automatically on failure
socker.onretry = (attemp, interval) => {};
```

## References

- <https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch>
- Response object <https://developer.mozilla.org/en-US/docs/Web/API/Response>
