# sifrr-dom

Sifrr's DOM library for creating user interfaces for websites.

### Size
| Type | Size     |
| :------------ | :------------: |
| Normal (`dist/sifrr.dom.js`)       | [![Normal](https://img.badgesize.io/sifrr/sifrr/master/packages/browser/sifrr-storage/dist/sifrr.dom.js?maxAge=600)](https://github.com/sifrr/sifrr/blob/master/packages/browser/sifrr-storage/dist/sifrr.dom.js) |
| Minified (`dist/sifrr.dom.min.js`) | [![Minified](https://img.badgesize.io/sifrr/sifrr/master/packages/browser/sifrr-storage/dist/sifrr.dom.min.js?maxAge=600)](https://github.com/sifrr/sifrr/blob/master/packages/browser/sifrr-storage/dist/sifrr.dom.min.js) |
| Minified + Gzipped (`dist/sifrr.dom.min.js`) | [![Minified + Gzipped](https://img.badgesize.io/sifrr/sifrr/master/packages/browser/sifrr-storage/dist/sifrr.dom.min.js?compression=gzip&maxAge=600)](https://github.com/sifrr/sifrr/blob/master/packages/browser/sifrr-storage/dist/sifrr.dom.min.js) |

## How to use
### Directly in Browser using standalone distribution
Add script tag in your website.
```html
<script src="https://unpkg.com/@sifrr/dom@0.1.0-alpha/dist/sifrr.dom.min.js"></script>
```

#### Compatibility table for standalone distribution (Needs support for JavaScript Promises)
- chrome >= 55
- safari >= 10.1
- opera >= 42
- firefox >= 53

### Using npm
Do `npm i @sifrr/dom` or `yarn add @sifrr/dom` or add the package to your `package.json` file.
Compatible with webpack/rollup etc, with plugin to convert commonjs files.
