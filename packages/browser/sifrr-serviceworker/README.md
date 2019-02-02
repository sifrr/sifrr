# sifrr-serviceworker · [![npm version](https://img.shields.io/npm/v/@sifrr/serviceworker.svg)](https://www.npmjs.com/package/@sifrr/serviceworker)

Customizable Service Worker.

## Size

| Type                                                   |                                                                                                                                          Size                                                                                                                                          |
| :----------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| Normal (`dist/sifrr.serviceworker.js`)                 |                    [![Normal](https://img.badgesize.io/sifrr/sifrr/master/packages/browser/sifrr-serviceworker/dist/sifrr.serviceworker.js?maxAge=600)](https://github.com/sifrr/sifrr/blob/master/packages/browser/sifrr-serviceworker/dist/sifrr.serviceworker.js)                   |
| Minified (`dist/sifrr.serviceworker.min.js`)           |               [![Minified](https://img.badgesize.io/sifrr/sifrr/master/packages/browser/sifrr-serviceworker/dist/sifrr.serviceworker.min.js?maxAge=600)](https://github.com/sifrr/sifrr/blob/master/packages/browser/sifrr-serviceworker/dist/sifrr.serviceworker.min.js)              |
| Minified + Gzipped (`dist/sifrr.serviceworker.min.js`) | [![Minified + Gzipped](https://img.badgesize.io/sifrr/sifrr/master/packages/browser/sifrr-serviceworker/dist/sifrr.serviceworker.min.js?compression=gzip&maxAge=600)](https://github.com/sifrr/sifrr/blob/master/packages/browser/sifrr-serviceworker/dist/sifrr.serviceworker.min.js) |

## How to use

### Directly in Browser using standalone distribution

Copy contents of `sifrr.serviceworker.min.js` or `sifrr.serviceworker.js` in your serviceworker file.
And add this at the end of file.

```js
const sw = new Sifrr.ServiceWorker(/* config */);
sw.setup(); // setup service worker caching
sw.setupPushNotification(defaultTitle, defaultOptions); // to setup push event listener
```

#### Browser API support needed for

| APIs               | caniuse                                    | polyfills    |
| :----------------- | :----------------------------------------- | :----------- |
| Service Worker API | <https://caniuse.com/#feat=serviceworkers> | Not possible |

### Using npm

Do `npm i @sifrr/serviceworker` or `yarn add @sifrr/serviceworker` or add the package to your `package.json` file.

example of `sw.js` to be bundled (compatible with webpack/rollup/etc):

#### Commonjs

```js
const SW = require('@sifrr/serviceworker');
const sw = new SW(/* config */);
sw.setup(); // setup service worker caching
sw.setupPushNotification(defaultTitle, defaultOptions); // to setup push event listener
module.exports = sw;
```

##### [Example here.](./test/public/sw.js)

#### ES modules

```js
import SW from '@sifrr/serviceworker'
const sw = new SW(/* config */);
sw.setup(); // setup service worker caching
sw.setupPushNotification(defaultTitle, defaultOptions); // to setup push event listener
export default sw;
```

then in your main js file add:

```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.bundled.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
```

## Config

Default config:

```js
{
  version: 1,
  fallbackCacheName: 'fallbacks',
  defaultCacheName: 'default',
  policies: {
    'default': {
      policy: 'NETWORK_FIRST',
      cacheName: 'default'
    }
  },
  fallbacks: {},
  precacheUrls: []
}
```

-   **version**: `integer` Version of service worker, when you change service worker version old versions' caches will be deleted. All caches are suffixed with `-v${version}`.
-   **fallbackCacheName**: `string` Name of cache storage for fallbacks.
-   **defaultCacheName**: `string` Default name of cache storage to be used.
-   **policies**:

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

-   **fallbacks**: `{ 'regex string': 'file url' }` If request's url matches regex string (same as policies), then fallback for that url will be file from `file url` if request is not completed due to no connection, not found, etc. 'default' fallback will be used if no regex matches the url given.
-   **precacheUrls**: `array of string` Urls to be precached.

### Policies

-   `NETWORK_ONLY`: Only resolve request from network.
-   `NETWORK_FIRST`: Try to resolve request from network, if fails then resolve from cache.
-   `CACHE_ONLY`: Only to resolve request from cache.
-   `CACHE_FIRST`: Try to resolve request from cache, if fails then resolve from network.
-   `CACHE_AND_UPDATE`: Send response from cache if available and then updates cache with new network response.

## Push Notification

1.  Setup push notification listener in serviceworker using
    `sw.setupPushNotification(defaultTitle, defaultOptions, onNotificationClick)`,
    where `defaultTitle` is default push notification title, `defaultOptions` are default push notification options and `onNotificationClick` is fxn that will be executed when user clicks on notification.

2.  In your main JS file use serviceWorkerRegistration object to handle pushNotifications.
    Simple Example:

```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.bundled.js').then(function(registration) {
      // `registration` is serviceWorkerRegistration object
      // SW registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: Uint8ArrayFromPushNotificationServerPublicKey
      })
      .then(function(subscription) {
        // Subscription was successful
        console.log('User is subscribed.');
      })
      .catch(function(err) {
        // Subscription failed
        console.log('Failed to subscribe the user: ', err);
      });
    }, function(err) {
      // SW registration failed
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
```

3.  Send payload from server as a JSON string with title and other options.
    Example:

```json
{
  "title": "You app name",
  "body": "Notification Body",
  "actions": [
    { "action": "yes", "title": "Yes", "icon": "images/yes.png" },
    { "action": "no", "title": "No", "icon": "images/no.png" }
  ],
  ...
}
```

## More manual configuring
In your sw file
```js
const sw = new SW(/* config */);

// this method will be called when new service worker is available to install
sw.onInstall = () => self.skipWaiting();

// this method will be called when a notification is clicked
sw.onNotificationClick = (event) => event.notification.close();

// You can add methods on self if you need
self.addEventListener(...);
```

### Tutorials

-   <https://developers.google.com/web/fundamentals/codelabs/push-notifications/>
-   <https://developers.google.com/web/fundamentals/push-notifications/display-a-notification>
-   <https://web-push-book.gauntface.com/demos/notification-examples/>
-   <https://stackoverflow.com/questions/38503481/web-push-notification-for-chrome>
