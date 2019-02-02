# sifrr-fetch · [![npm version](https://img.shields.io/npm/v/@sifrr/fetch.svg)](https://www.npmjs.com/package/@sifrr/fetch)

Fetch based http requests library for browsers.

## Size

| Type                                           |                                                                                                                          Size                                                                                                                          |
| :--------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| Normal (`dist/sifrr.fetch.js`)                 |                    [![Normal](https://img.badgesize.io/sifrr/sifrr/master/packages/browser/sifrr-fetch/dist/sifrr.fetch.js?maxAge=600)](https://github.com/sifrr/sifrr/blob/master/packages/browser/sifrr-fetch/dist/sifrr.fetch.js)                   |
| Minified (`dist/sifrr.fetch.min.js`)           |               [![Minified](https://img.badgesize.io/sifrr/sifrr/master/packages/browser/sifrr-fetch/dist/sifrr.fetch.min.js?maxAge=600)](https://github.com/sifrr/sifrr/blob/master/packages/browser/sifrr-fetch/dist/sifrr.fetch.min.js)              |
| Minified + Gzipped (`dist/sifrr.fetch.min.js`) | [![Minified + Gzipped](https://img.badgesize.io/sifrr/sifrr/master/packages/browser/sifrr-fetch/dist/sifrr.fetch.min.js?compression=gzip&maxAge=600)](https://github.com/sifrr/sifrr/blob/master/packages/browser/sifrr-fetch/dist/sifrr.fetch.min.js) |

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
import Fetch from '@sifrr/fetch';
window.Sifrr = window.Sifrr || {};
window.Sifrr.Fetch = Fetch;
```

## API

-   GET request

```js
Sifrr.Fetch.get(url, options).then((response) => {
  // response is JSON if response has `content-type: application/json` header
  // else it is a Fetch API response object.
});
```

-   PUT request

```js
Sifrr.Fetch.put(url, options).then((response) => {
  // response is JSON if response has `content-type: application/json` header
  // else it is a Fetch API response object.
});
```

-   POST request

```js
Sifrr.Fetch.post(url, options).then((response) => {
  // response is JSON if response has `content-type: application/json` header
  // else it is a Fetch API response object.
});
```

-   DELETE request

```js
Sifrr.Fetch.delete(url, options).then((response) => {
  // response is JSON if response has `content-type: application/json` header
  // else it is a Fetch API response object.
});
```

-   GET file request

```js
Sifrr.Fetch.file(url, options).then((response) => {
  // response is a Fetch API response object.
});
```

options are Fetch API options some extra keys:

-   **params** `json object` key, value pairs will be added to url as ?key=value
-   POST GRAPHQL request

```js
Sifrr.Fetch.graphql(url, { query: 'graphql query string', variables: { a: 'b' }, ...otherOptions }).then((response) => {
  // response is JSON if response has `content-type: application/json` header
  // else it is a Fetch API response object.
});
```

## References

-   <https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch>
-   Response object <https://developer.mozilla.org/en-US/docs/Web/API/Response>
