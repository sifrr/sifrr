# sifrr-route · [![npm version](https://img.shields.io/npm/v/@sifrr/route.svg)](https://www.npmjs.com/package/@sifrr/route) [![Doscify](https://img.shields.io/badge/API%20docs-Docsify-red.svg)](https://sifrr.github.io/sifrr/#/./packages/browser/sifrr-route/)

History API based Routing library for building One Page Applications with sifrr.

### Browser API support needed for

| APIs        | caniuse                             | polyfills                                    |
| :---------- | :---------------------------------- | :------------------------------------------- |
| History API | <https://caniuse.com/#feat=history> | <https://github.com/browserstate/history.js> |

## How to use

**Note** `sifrr-route` only works inside another wrapper sifrr element, since it uses prop `path`

1.  Copy contents of `dist/sifrr.route.js` to `elements/sifrr/route.js` folder in your sifrr app. And use `Sifrr.Dom.load('sifrr-route')` to load sifrr-route.
2.  Or you can directly import in html:

```html
<!-- Using ES6 modules and NPM -->
import '@sifrr/route';
<!-- OR ES6 modules and using CDN -->
<script
  src="https://unpkg.com/@sifrr/route@{version}/dist/sifrr.route.min.js"
  charset="utf-8"
  type="module"
></script>
<!-- OR without module -->
<script
  src="https://unpkg.com/@sifrr/route@{version}/dist/sifrr.route.min.js"
  charset="utf-8"
></script>
```

- You also need to take care in your server configuration that correct html file is served for all sifrr-routes.

Good way can be to serve `index.html` to all routes and define all routes in this file.

### Routing

Add sifrr-route tag in your html, this will only be shown when `window.location.pathname` is same as `path` prop unless it has `target` attribute and it is not equal to `_self` or link is of some other domain.

```html
<sifrr-route :path="/some-path">
  <!-- Contents -->
</sifrr-route>
```

Note that when `sifrr-route` is loaded, clicking on a link `a` won't reload the page, but only show sifrr-routes with matching pathname. If you want the page to reload add `target='_top'` to `a` tag.

- You can use `sifrr-route` inside another `sifrr-route`.

- path prop can be a sifrr-dom binding as well, and it should work without any problems

- you can also use regex in `path` but it will be shown only if it is exact match of pathname, eg: `/(.*)/abcd` will match `/qwert/abcd` but not `/qwert/abcd/efgh`

- URL Query string is not matched

- You can also you special syntax if you want to parse pathname and use it:

  - `:alphanumeric` matches anything without `/` as alphanumeric variable.

  - `*` matches anything without `/` as star variable.

  - `**` matches everything
    eg. `/:x/*/**/mnop/*/:k` will match `/new/def/ghi/klm/mnop/sdf/klm` and parse it as

  ```js
    {
      '*': [ "def", "sdf" ],
      '**': [ "ghi/klm" ],
      x: "new",
      k: "klm"
    }
  ```

  and make `sifrr-route` tag with `:path="/:x/*/**/mnop/*/:k"`'s state equal to this parsed data

### Class

- Sifrr-routes matching `window.location.pathname` will have `active` class
- Sifrr-routes not matching `window.location.pathname` will not have `active` class. You can add animations etc, based on this.

### State of element

Is equal to data parsed using special syntax as mentioned above

### Changing title

Clicking on

```html
<a href="/" title="Home">HOME</a>
```

Will change document's title to `Home` (title attribute) and shows sifrr-routes which are active.
If you want to do any complex operation, you can either add a `onStateChange()` method on `sifrr-route` or use a click event listener on links.

### Passing state

Any child elements with `[data-sifrr-route-state="true"]` will get passed state from parent sifrr-route.
eg.

```html
<sifrr-route id="complex" path="/test/:id" data-sifrr-elements="sifrr-test">
  Route state check
  <sifrr-test data-sifrr-route-state="true"></sifrr-test>
</sifrr-route>
```

When window location path is `/test/1`, sifrr-route's state will be `{ id: 1 }` and sifrr-test's state will be `{ route: { id: 1 } }`

## Animating

### CSS

```css
sifrr-route {
}
sifrr-route.active {
  opacity: 0;
  animation: anim 0.3s ease forwards;
}
@keyframes anim {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

### JS

using [sifrr-animate](https://github.com/sifrr/sifrr-animate)

```js
// all sifrr-routes
Sifrr.Dom.Event.addListener('activate', 'sifrr-route', (e, t) => {
  Sifrr.animate({
    target: t,
    to: {
      style: {
        opacity: ['0', '1'],
        transform: ['scale3d(0.5,0.5,0.5)', 'scale3d(1,1,1)']
      }
    }
  });
});
// particular sifrr-route
Sifrr.Dom.Event.addListener('activate', document.$('sifrr-route#animated'), (e, t) => {
  Sifrr.animate({
    target: t,
    to: {
      style: {
        opacity: ['0', '1'],
        transform: ['scale3d(0.5,0.5,0.5)', 'scale3d(1,1,1)']
      }
    }
  });
});
```
