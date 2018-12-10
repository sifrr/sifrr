# sifrr-fetch

Fetch based http requests library for browsers.

### Size
| Type | Size     |
| :------------ | :------------: |
| Normal (`dist/sifrr.fetch.js`)       | [![Normal](https://img.badgesize.io/sifrr/sifrr/master/packages/browser/sifrr-fetch/dist/sifrr.fetch.js?maxAge=600)](https://github.com/sifrr/sifrr/blob/master/packages/browser/sifrr-fetch/dist/sifrr.fetch.js) |
| Minified (`dist/sifrr.fetch.min.js`) | [![Minified](https://img.badgesize.io/sifrr/sifrr/master/packages/browser/sifrr-fetch/dist/sifrr.fetch.min.js?maxAge=600)](https://github.com/sifrr/sifrr/blob/master/packages/browser/sifrr-fetch/dist/sifrr.fetch.min.js) |
| Minified + Gzipped (`dist/sifrr.fetch.min.js`) | [![Minified + Gzipped](https://img.badgesize.io/sifrr/sifrr/master/packages/browser/sifrr-fetch/dist/sifrr.fetch.min.js?compression=gzip&maxAge=600)](https://github.com/sifrr/sifrr/blob/master/packages/browser/sifrr-fetch/dist/sifrr.fetch.min.js) |

## How to use
### Directly in Browser using standalone distribution
Add script tag in your website.
```html
<script src="https://unpkg.com/@sifrr/fetch@0.1.0-alpha/dist/sifrr.fetch.min.js"></script>
```

#### Compatibility table for standalone distribution (Needs support for JavaScript Fetch API)
- chrome >= 55
- safari >= 10.1
- opera >= 42
- firefox >= 53


### Using npm
Do `npm i @sifrr/fetch` or `yarn add @sifrr/fetch` or add the package to your `package.json` file.
Compatible with webpack/rollup etc, with plugin to convert commonjs files.
