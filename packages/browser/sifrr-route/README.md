# sifrr-route

History API based Routing library for building One Page Applications with sifrr.

## How to use

1.  Copy contents of `dist/sifrr.route.js` to `elements/sifrr/route.js` folder in your sifrr app. And use `Sifrr.Dom.load('sifrr-route')` to load sifrr-route.
2.  Or you can directly import in html:

```html
<script type="module">
  import '@sifrr/route';
</script>
```

-   You also need to take care in your server configuration that correct html file is served for all sifrr-routes.

Good way can be to serve `index.html` to all routes and define all routes in this file.

### Routing

Add sifrr-route tag in your html, this will only be shown when `window.location.pathname` is same as `data-sifrr-path` unless it has `target` attribute and it is not equal to `_self` or link is of some other domain.

```html
<sifrr-route data-sifrr-path='/some-path'>
  <!-- Contents -->
</sifrr-route>
```

Note that when `sifrr-route` is loaded, clicking on a link `a` won't reload the page, but only show sifrr-routes with matching pathname.

-   You can use `sifrr-route` inside another `sifrr-route`.
-   you can also use regex in `data-sifrr-path` but it will be shown only if it is exact match of pathname, eg: `/(.*)/abcd` will match `/qwert/abcd` but not `/qwert/abcd/efgh`
-   Query variables are not matched
-   You can also you special syntax if you want to parse pathname and use it:
    -   `:alphanumeric` matches anything without `/` as alphanumeric variable.
    -   `*` matches anything without `/` as star variable.
    -   `**` matches everything
        eg. `/:x/*/**/mnop/*/:k` will match `/new/def/ghi/klm/mnop/sdf/klm` and parse it as
    ```js
      {
        star: [ "def", "sdf" ],
        doubleStar: [ "ghi/klm" ],
        x: "new",
        k: "klm"
      }
    ```
    and make `sifrr-route` tag with `data-sifrr-path="/:x/*/**/mnop/*/:k"`'s state equal to this parsed data

### Class

-   Sifrr-routes matching `window.location.pathname` will have `active` class
-   Sifrr-routes not matching `window.location.pathname` will not have `active` class.
    You can add animations etc, based on this.

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
<sifrr-route id="complex" data-sifrr-path='/test/:id' data-sifrr-elements='sifrr-test'>
  Route state check
  <sifrr-test data-sifrr-route-state="true"></sifrr-test>
</sifrr-route>
```

When window location path is `/test/1`, sifrr-route's state will be `{ id: 1 }` and sifrr-test's state will be `{ route: { id: 1 } }`
