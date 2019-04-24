# sifrr-storage · [![npm version](https://img.shields.io/npm/v/@sifrr/storage.svg)](https://www.npmjs.com/package/@sifrr/storage)

Browser key-value(JSON) storage library with cow powers. ~2KB alternative to [localForage](https://github.com/localForage/localForage)

## Size

| Type                                             |                                                                                                                              Size                                                                                                                              |
| :----------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| Normal (`dist/sifrr.storage.js`)                 |                    [![Normal](https://img.badgesize.io/sifrr/sifrr/master/packages/browser/sifrr-storage/dist/sifrr.storage.js?maxAge=600)](https://github.com/sifrr/sifrr/blob/master/packages/browser/sifrr-storage/dist/sifrr.storage.js)                   |
| Minified (`dist/sifrr.storage.min.js`)           |               [![Minified](https://img.badgesize.io/sifrr/sifrr/master/packages/browser/sifrr-storage/dist/sifrr.storage.min.js?maxAge=600)](https://github.com/sifrr/sifrr/blob/master/packages/browser/sifrr-storage/dist/sifrr.storage.min.js)              |
| Minified + Gzipped (`dist/sifrr.storage.min.js`) | [![Minified + Gzipped](https://img.badgesize.io/sifrr/sifrr/master/packages/browser/sifrr-storage/dist/sifrr.storage.min.js?compression=gzip&maxAge=600)](https://github.com/sifrr/sifrr/blob/master/packages/browser/sifrr-storage/dist/sifrr.storage.min.js) |

## Types of storages available (in default priority order)

-   IndexedDB (Persisted - on page refresh or open/close)
-   WebSQL (Persisted - on page refresh or open/close)
-   LocalStorage (Persisted - on page refresh or open/close)
-   Cookies (Persisted - on page refresh or open/close), Sent to server with every request
-   JsonStorage (In memory - deleted on page refresh or open/close)

## How to use

### Directly in Browser using standalone distribution

Add script tag in your website.

```html
<script src="https://unpkg.com/@sifrr/storage@{version}/dist/sifrr.storage.min.js"></script>
```

#### Browser API support needed

| APIs         | caniuse                                       | polyfills                                     |
| :----------- | :-------------------------------------------- | :-------------------------------------------- |
| Promises API | <https://caniuse.com/#feat=promises>          | <https://github.com/stefanpenner/es6-promise> |
| IndexedDB    | <https://caniuse.com/#feat=indexeddb>         | N/A                                           |
| WebSQL       | <https://caniuse.com/#feat=sql-storage>       | N/A                                           |
| LocalStorage | <https://caniuse.com/#feat=namevalue-storage> | N/A                                           |
| Cookies      | 100%                                          | N/A                                           |

### Using npm

Do `npm i @sifrr/storage` or `yarn add @sifrr/storage` or add the package to your `package.json` file.

example, put in your frontend js module (compatible with webpack/rollup/etc):

#### Commonjs

```js
window.Sifrr = window.Sifrr || {};
window.Sifrr.Storage = require('@sifrr/storage');
```

#### ES modules

```js
import Storage from '@sifrr/storage';
window.Sifrr = window.Sifrr || {};
window.Sifrr.Storage = Storage;
```

## API

Sifrr.Storage uses Promises.

### Initialization

-   Initialize a storage with a type

```js
let storage = new Sifrr.Storage(type)
```

where type is one of `indexeddb`, `websql`, `localstorage`, `cookies`, `jsonstorage`.

_Note_: If that type is not supported in the browser, then first supported storage will be selected based on priority order.

-   Initialize with options

```js
// Options with default values
let options = {
  priority: ['indexeddb', 'websql', 'localstorage', 'cookies', 'jsonstorage'], // Priority Array of type of storages to use
  name: 'SifrrStorage', // name of table (treat this as a variable name, i.e. no Spaces or special characters allowed)
  version: 1, // version number (integer / float / string), 1 is treated same as '1'
  desciption: 'Sifrr Storage', // description (text)
  size: 5 * 1024 * 1024 // Max db size in bytes only for websql (integer)
}
storage = new Sifrr.Storage(options)
```

**Initializing with same priority, name and version will give same instance.**

### Details

```js
storage.type; // type of storage
storage.name; // name of storage
storage.version; // version number
```

### Setting key-value

```js
// insert single key-value
let key = 'key';
let value = { value: 'value' };
storage.set(key, value).then(() => {/* Do something here */});

// insert multiple key-values
let data = { a: 'b', c: { d: 'e' } }
storage.set(data).then(() => {/* Do something here */});
```

### Getting value

```js
// select single key-value
storage.get('key').then((value) => console.log(value)); // > { key: { value: 'value' } }

// select multiple key-values
storage.get(['a', 'c']).then((value) => console.log(value)); // > { a: 'b', c: { d: 'e' } }
```

### Deleting a key

```js
// delete single key-value
storage.del('key').then(() => {/* Do something here */});

// delete multiple key-values
storage.del(['a', 'c']).then(() => {/* Do something here */});
```

### Updating a key

`.set()` will update the value.

### Get all data in table

```js
storage.all().then((data) => console.log(data)); // > { key: { value: 'value' }, a: 'b', c: { d: 'e' } }
```

### Get all keys in table

```js
storage.keys().then((keys) => console.log(data)); // > ['key', 'a', 'c']
```

### Clear table

```js
storage.clear().then(() => {
  // checking if data is deleted
  storage.all().then((data) => console.log(data)); // > {}
});
```

### Get all created storage instances

```js
Sifrr.Storage.all;
```
