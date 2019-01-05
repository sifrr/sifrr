# sifrr-dom &middot; [![npm version](https://img.shields.io/npm/v/@sifrr/dom.svg)](https://www.npmjs.com/package/@sifrr/dom)

A < 5KB DOM library for creating user interfaces for websites using Custom Elements, one way/two way data binding.

### Size
| Type | Size     |
| :------------ | :------------: |
| Normal (`dist/sifrr.dom.js`)       | [![Normal](https://img.badgesize.io/sifrr/sifrr/master/packages/browser/sifrr-dom/dist/sifrr.dom.js?maxAge=600)](https://github.com/sifrr/sifrr/blob/master/packages/browser/sifrr-dom/dist/sifrr.dom.js) |
| Minified (`dist/sifrr.dom.min.js`) | [![Minified](https://img.badgesize.io/sifrr/sifrr/master/packages/browser/sifrr-dom/dist/sifrr.dom.min.js?maxAge=600)](https://github.com/sifrr/sifrr/blob/master/packages/browser/sifrr-dom/dist/sifrr.dom.min.js) |
| Minified + Gzipped (`dist/sifrr.dom.min.js`) | [![Minified + Gzipped](https://img.badgesize.io/sifrr/sifrr/master/packages/browser/sifrr-dom/dist/sifrr.dom.min.js?compression=gzip&maxAge=600)](https://github.com/sifrr/sifrr/blob/master/packages/browser/sifrr-dom/dist/sifrr.dom.min.js) |

## Fetures
- Simple API based on web components v1, custom elements v1, shadow dom v1 with callbacks
- bindings (js based) without virtual DOM (faster than react), no special syntax except pure HTML, CSS, JS
- synthetic event listener
- simpler querySelector for custom elements/web components

## How to use
### Directly in Browser using standalone distribution
Add script tag in your website.
```html
<script src="https://unpkg.com/@sifrr/dom@0.1.0-alpha1/dist/sifrr.dom.min.js"></script>
```

#### Compatibility table for standalone distribution (Needs support for JavaScript Custom Elements, Shadow DOM, Fetch API)
- chrome >= 55
- safari >= 10.1
- opera >= 42
- firefox >= 53

### Using npm
Do `npm i @sifrr/dom` or `yarn add @sifrr/dom` or add the package to your `package.json` file.

example, put in your frontend js module (compatible with webpack/rollup/etc):
#### Commonjs
```js
// index.js

window.Sifrr = window.Sifrr || {};
window.Sifrr.Dom = require('@sifrr/dom');
```

#### ES modules
```js
// index.js

import DOM from '@sifrr/dom';
window.Sifrr = window.Sifrr || {};
window.Sifrr.Dom = DOM;
```

## Basic API usage
### Setting Up
```js
// index.js

// Default Setup Config for Sifrr Dom
const config = {
  baseUrl: '', // base url for sifrr elements, should start with '/' and should not end with '/'
  useShadowRoot: true // use shadow root by default or not
}
// Set up Sifrr-Dom
Sifrr.Dom.setup(config);
```

### Sifrr element
#### Basic sifrr element
```html
<!-- ${baseUrl}/elements/custom/tag.html  -->

<template>
  <style media="screen">
    p {
      color: blue; // Only applies to p's inside this element if useShadowRoot is true in setup config
    }
  </style>
  <!-- Contents for element, this in binding ${} refers to the custom element itself -->
  <!-- Bindings are updated automatically on state change -->
  <p attr=${this.state.attr}>${this.state.id}</p>
  <p>${this.data()}</p>
  <!-- If you are using any custom methods in bindings, it is better they are based on state so that they are updated on state change -->
</template>
<script type="text/javascript">
  // elements name will be changing class name from camelcase to dash separated
  // eg. CutomTag -> custom-tag, LongCrazyNameElement -> long-crazy-name-element
  class CustomTag extends Sifrr.Dom.Element {
    // other methods for the custom element
    data() {
      return this.state.id * 2;
    }
  }
  CustomTag.defaultState = {
    // default state for this element
    id: 1,
    attr: 'abcd'
  }
  Sifrr.Dom.register(CustomTag);
</script>
```
```js
// index.js

const config = {
  baseUrl: ''
}
Sifrr.Dom.load('custom-tag', config); // custom-tag element is loaded from ${baseUrl}/elements/custom/tag.html
// If no baseUrl is given in config, baseUrl from setup config is used
```
- This html
```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <title></title>
  </head>
  <body>
    <!-- Put custom tag anywhere to render that element -->
    <custom-tag></custom-tag>
    <script src="index.js" charset="utf-8"></script>
  </body>
</html>
```
will render to
```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <title></title>
  </head>
  <body>
    <custom-tag>
      #shadow-root
      <!-- Content will be rendered in shadow root if useShadowRoot is set to true in setup config -->
        <p>1</p>
        <p attr="abcd">2</p>
    </custom-tag>
    <script src="index.js" charset="utf-8"></script>
  </body>
</html>
```
#### Changing state of element
```js
const customtag = window.querySelector('custom-tag');
customtag.state = { id: 2, attr: 'xyz' }
// Note: doing `customtag.state.id = 2` doesn't work
```
This will change custom-tag to
```html
<custom-tag>
  #shadow-root
    <p attr="xyz">2</p>
    <p>4</p>
</custom-tag>
```

- To force update element bindings
```js
customtag.update();
```

### Components Without shadow root
#### If you don't want to use shadow root by default
```js
// index.js

const config = {
  baseUrl: '/',
  useShadowRoot: false
}
Sifrr.Dom.setup(config);
```
#### If you don't want to use shadow root for a particular component
```html
<!-- ${baseUrl}/elements/custom/tag.html -->
<template use-shadow-root="false">
  <style media="screen">
    // Style here will be global
  </style>
  <!-- content -->
</template>
<script type="text/javascript">
  // Same setting up as before
</script>
```

### Sifrr Element (Sifrr.Dom.Element) API
#### Callbacks
```js
class CustomTag extends Sifrr.Dom.Element {
  static observedAttrs() {
    return ['custom-attr']; // these attributes will be observed for changes
  }

  onConnect() {
    // called when element is connected to dom
    // A good place to manipulate dom inside the custom element like adding event listeners, etc.
  }

  onDisconnect() {
    // called when element is disconnected to dom
  }

  onAttributeChange(attrName, oldVal, newVal) {
    // called when an attribute in observedAttrs array is changed
  }

  onStateChange(newState) {
    // called when element's state is changed
  }
}
```

#### Clearing state of element
```js
customtag.clearState()
```

#### Query selectors for custom element content
```js
// querySelector
customtag.$(selector, shadowRoot = true if element uses shadow root else false by default);
// querySelectorAll
customtag.$$(selector, shadowRoot = true if element uses shadow root else false by default);
// If shadowRoot is true, it selects elements inside element shadowRoot else it will select elements inside it
```

### Synthetic events
```js
// example for adding 'click' event listeners can be replaced with any type of event

// Add synthetic event listerner (only need to be called once for one type of event)
Sifrr.Dom.Event.add('click');

// Adding event callback on a element (any element not just sifrr element), works inside shadowRoots too
el.$click = fxn;
// fxn will be called with two arguments `fxn(event, target)`

// Adding a generic event callback
Sifrr.Dom.Event.addListener('click', selector, fxn);
// fxn will be called with same two arguments as before if event target matches the selector provided

// Triggering custom events
Sifrr.Dom.Event.trigger(target, 'custom:event', options);
// options are same as options for new window.Event(target, 'custom:event', options);
```

### More complex apis
#### html in bindings
```html
<!-- ${baseUrl}/elements/custom/tag.html -->

<template>
  <div data-sifrr-html="true">
    <!-- comment bindings are allowed inside data-sifrr-html="true" -->
    <!-- Multiple bindings are allowed if they are html string -->
    ${this.html()}
    ${this.state.html}
    <!-- ${this.state.html2} -->
  <div>
  <div data-sifrr-html="true">
    <!-- Only one binding is allowed if it is html component or array of components -->
    ${this.state.htmlElement}
  <div>
</template>
<script type="text/javascript">
  class CustomTag extends Sifrr.Dom.Element {
    html() {
      return '<p>html function</p>';
    }
  }
  CustomTag.defaultState = {
    html: '<div><p>normal html<p><div>',
    html2: '<div>comment html<div>',
    htmlElement: document.createElement('table')
  }
  Sifrr.Dom.register(CustomTag);
</script>
```
this will render
```html
<custom-tag>
  #shadow-root
    <div data-sifrr-html="true">
      <p>html function</p>
      <div>
        <p>normal html<p>
      <div>
      <div>
        comment html
      <div>
    <div>
    <div data-sifrr-html="true">
      <table></table>
    <div>
</custom-tag>
```
#### input/select/textarea/contenteditable one way, two way bindings
```html
<!-- inside template -->
<!-- One Way bindings to value, updates value/content when state is changed -->
<input value=${this.state.input}>
<select value="${this.state.select}">
  <!-- options -->
</select>
<textarea>${this.state.textarea}</textarea>
<div contenteditable>
  ${this.state.elements}
</div>

<!-- One Way bindings from value, updates state when value/content is changed (on input/change event) -->
<input data-sifrr-bind="input">
<select data-sifrr-bind="select">
  <!-- options -->
</select>
<textarea data-sifrr-bind="textarea"></textarea>
<div contenteditable data-sifrr-bind="elements">
</div>

<!-- Both together -->
<input value=${this.state.input} data-sifrr-bind="input">
<select value="${this.state.select}"  data-sifrr-bind="select">
  <!-- options -->
</select>
<textarea data-sifrr-bind="textarea">${this.state.textarea}</textarea>
<div contenteditable data-sifrr-bind="elements">
  ${this.state.elements}
</div>

```
#### arrayToDom,
parses array to dom nodes in bindings
```html
<!-- ${baseUrl}/elements/custom/array.html -->

<template>
  <p>${this.state.id}</p>
</template>
<script type="text/javascript">
  class CustomArray extends Sifrr.Dom.Element {}
  Sifrr.Dom.register(CustomArray);
</script>
```
```html
<!-- ${baseUrl}/elements/custom/tag.html -->

<template>
<!-- arrayToDom takes two arguments, first is unique key and other is array data to parse
  <div data-sifrr-html="true">
    <!-- ${this.arrayToDom('uniqueKey', this.state.data)} -->
  <div>
</template>
<script type="text/javascript">
  class CustomTag extends Sifrr.Dom.Element {

  }
  CustomTag.defaultState = {
    data: [{ id: '1' }, { id: '2' }] // Each state will be passed to elements created by arrayToDom
  }
  // addArrayToDom takes two arguments, first - uniqueKey which is used by arrayToDom and
  // second - element that will be added by arrayToDom for each array element
  // You can give either a domElement or html string with only one parent element '<div><p>${id}</p></div>',
  // '<p>${id}</p><p>${id}</p>' won't work because of two parent elements (only first p will be rendered)
  // this element can be sifrr element also
  // Note that in custom html, binding is ${id} and in sifrr-element it is ${this.state.id}
  CustomTag.addArrayToDom('uniqueKey', document.createElement('custom-array'));
  Sifrr.Dom.register(CustomTag);
</script>
```
then, `<custom-tag></custom-tag>` will render:
```html
<custom-tag>
  #shadow-root
  <div data-sifrr-html="true">
    <custom-array>
      #shadow-root
        <p>1</p>
    </custom-array>
    <custom-array>
      #shadow-root
        <p>2</p>
    </custom-array>
  <div>
<custom-tag>
```

#### Extending another decalred html element
Sifrr element can extend other html elements also, eg:
CustomTag extends HTMLButtonElement here, note that register call has { extends: 'button' } as second argument
```js
class CustomTag extends Sifrr.Dom.Element.extends(HTMLButtonElement) {}
Sifrr.Dom.register(SifrrSmaller, {
  extends: 'button'
});
```
then you can use custom-tag as button in html like:
```html
<button is="custom-tag"></button>
```

#### slots
- Slots work same as it would in web components, but note that bindings in slot elements won't work

## More readings
- https://developers.google.com/web/fundamentals/web-components/customelements

## Special thanks to:
- https://github.com/Freak613/stage0 for optimization ideas
- https://github.com/krausest/js-framework-benchmark for benchmarking performance
