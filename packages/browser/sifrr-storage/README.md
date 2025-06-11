# sifrr-storage · [![npm version](https://img.shields.io/npm/v/@sifrr/storage.svg)](https://www.npmjs.com/package/@sifrr/storage) [![Doscify](https://img.shields.io/badge/API%20docs-Docsify-red.svg)](https://sifrr.github.io/sifrr/#/./packages/browser/sifrr-storage/)

Browser key-value(JSON) storage library with cow powers. ~2KB alternative to [localForage](https://github.com/localForage/localForage)

## Size

| Type                                             |                            Size                            |
| :----------------------------------------------- | :--------------------------------------------------------: |
| Minified (`dist/sifrr.storage.min.js`)           |  ![](https://badgen.net/bundlephobia/min/@sifrr/storage)   |
| Minified + Gzipped (`dist/sifrr.storage.min.js`) | ![](https://badgen.net/bundlephobia/minzip/@sifrr/storage) |

## Types of storages available (in default priority order)

- IndexedDB (Persisted - on page refresh or open/close)
- LocalStorage (Persisted - on page refresh or open/close)
- Cookies (Persisted - on page refresh or open/close), Sent to server with every request
- Memory (In memory - deleted on page refresh or open/close)

## How to use

### Directly in Browser using standalone distribution

Add script tag in your website.

```html
<script src="https://unpkg.com/@sifrr/storage@{version}/dist/index.iife.js"></script>
// Adds window.Sifrr.Storage
```

#### Browser API support needed

| APIs         | caniuse                                       | polyfills                                     |
| :----------- | :-------------------------------------------- | :-------------------------------------------- |
| Promises API | <https://caniuse.com/#feat=promises>          | <https://github.com/stefanpenner/es6-promise> |
| IndexedDB    | <https://caniuse.com/#feat=indexeddb>         | N/A                                           |
| LocalStorage | <https://caniuse.com/#feat=namevalue-storage> | N/A                                           |
| Cookies      | 100%                                          | N/A                                           |

### Using npm

Do `npm i @sifrr/storage` or `yarn add @sifrr/storage` or add the package to your `package.json` file.

example, put in your frontend js module (compatible with webpack/rollup/etc):

#### Commonjs

```js
const { Storage } = require('@sifrr/storage');
```

#### ES modules

```js
import { Storage } from '@sifrr/storage';
import { IndexedDBStore, LocalStorageStore, CookieStore, MemoryStore } from '@sifrr/storage';
// or Sifrr.Storage.Storage (script tag)

const storage = new Storage({
  store: [IndexedDBStore, LocalStorageStore, CookieStore, MemoryStore], // it will pick first supported store from list
  prefix: 'store1/'
});
```

## API

Sifrr.Storage uses Promises, but the api itself is similar to `Map` with some small differences like it also supports `all` and `clear` and also takes ttl in `set`

### Initialization

- Initialize a storage

```js
const storage = new Storage({
  store: [IndexedDBStore, LocalStorageStore, CookieStore, MemoryStore], // it will pick first supported store from list
  prefix: 'store1/' // optional, default: '', save prefix storage will use set/get same values since storages are shared
});
```

_Note_: If that type is not supported in the browser, then first supported storage will be selected based on priority order.

**Initializing with same priority, name and version will give same instance.**

### Setting key-value

```js
// insert key-value
let key = 'key';
let value = { a: 'b' };
storage.set(key, value).then(() => {
  /* Do something here */
});

// inserting with different ttl (30 seconds in example) than set in third param
storage.set(key, value, 30 * 1000).then(() => {
  /* Do something here */
});
```

**Note** Cookies are trucated after ~628 characters in chrome (total of key + value characters), other browsers may tructae at other values as well. Use cookies for small data only

### Getting value

```js
// get key-value
storage.get('key').then((value) => console.log(value)); // > { a: 'b' }
```

### Deleting a key

````js
// delete key-value
storage.delete('key').then(() => {
  /* Do something here */
});

### Updating a key

`.set()` will update the value as well.

### Get all data in table

```js
storage.all().then(data => console.log(data)); // > { key: { a: 'b' }, a: 'b', c: { d: 'e' } }
````

### Clear table

```js
storage.clear().then(() => {
  // checking if data is deleted
  storage.all().then((data) => console.log(data)); // > {}
});
```

### Use for memoization or any function

```js
function some(a, b, c, d) {
  // expensive computation
  return 'a';
}

const memoizedSome = storage.memoize(some); // cache key is unique for unique first function argument

// custom cache key function, should return string
function cacheKeyFunction(a, b, c, d) {
  return JSON.stringify(c);
}
const memoizedSomeCustomCache = storage.memoize(some, cacheKeyFunction);
```

## Types of data supported

### key

should be `string`

### value

can be any of these types:

- `Array`,
- `ArrayBuffer`,
- `Blob`,
- `Float32Array`,
- `Float64Array`,
- `Int8Array`,
- `Int16Array`,
- `Int32Array`,
- `Number`,
- `Object`,
- `Uint8Array`,
- `Uint16Array`,
- `Uint32Array`,
- `Uint8ClampedArray`,
- `String`

### Gotchas

- When using localStorage, websql or cookies, binary data will be serialized before being saved (and retrieved). This serialization will incur a size increase when binary data is saved, and might affect performance.
- Since object[key] is `undefined` when key is not present in the object, `undefined` is not supported as a value.
- `null` value has buggy behaviour in localstorage, as it returns `null` when value is not present.
- If you want to save falsy values, you can save `false` or `0` which are supported by all storages.
