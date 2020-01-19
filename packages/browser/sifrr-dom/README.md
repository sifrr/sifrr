# sifrr-dom · [![npm version](https://img.shields.io/npm/v/@sifrr/dom.svg)](https://www.npmjs.com/package/@sifrr/dom) [![Doscify](https://img.shields.io/badge/API%20docs-Docsify-red.svg)](https://sifrr.github.io/sifrr/#/./packages/browser/sifrr-dom/)

A ~6KB :zap: fast DOM framework for creating web user interfaces using Custom Elements with state management, one way/two way data bindings etc.

Sifrr-Dom is best of both worlds: write components in pure HTML, CSS, JS with ease-of-use and features of a full fledged JS framework like css scoping (shadow root), events, reconciliation etc.

## Size

| Type                                         |                          Size                          |
| :------------------------------------------- | :----------------------------------------------------: |
| Minified (`dist/sifrr.dom.min.js`)           |  ![](https://badgen.net/bundlephobia/min/@sifrr/dom)   |
| Minified + Gzipped (`dist/sifrr.dom.min.js`) | ![](https://badgen.net/bundlephobia/minzip/@sifrr/dom) |

## Tradeoffs

- :+1: Uses @sifrr/template and adds custom elements, prop/state management on top of it
- :+1: Use latest web API standards (custom elements v1)
- :+1: CSS scoping with shadow root
- :-1: hence will not work in older browsers without [polyfills](#browser-api-support-needed-for)
- :+1: In-built Synthetic event listeners and custom events

## Performance Comparison

[Check Performance Here](https://rawgit.com/krausest/js-framework-benchmark/master/webdriver-ts-results/table.html)

**Note**: These might not be exact and should only be taken as a reference.

## How to use

### Directly in Browser using standalone distribution

Add script tag in your website.

```html
<!-- Sifrr.Template is also required -->
<script src="https://unpkg.com/@sifrr/template@{version}/dist/sifrr.template.min.js"></script>
<script src="https://unpkg.com/@sifrr/dom@{version}/dist/sifrr.dom.min.js"></script>
```

#### Browser API support needed for

| APIs                                                 | caniuse                                       | polyfills                                          |
| :--------------------------------------------------- | :-------------------------------------------- | :------------------------------------------------- |
| Custom Elements v1                                   | <https://caniuse.com/#feat=custom-elementsv1> | <https://github.com/webcomponents/custom-elements> |
| Promises API                                         | <https://caniuse.com/#feat=promises>          | <https://github.com/stefanpenner/es6-promise>      |
| Shadow DOM v1                                        | <https://caniuse.com/#feat=shadowdomv1>       | <https://github.com/webcomponents/shadydom>        |
| ES6 Modules (if you use type='module' on script tag) | <https://caniuse.com/#feat=es6-module>        | <https://github.com/ModuleLoader/es-module-loader> |
| Fetch API (if you use `Sifrr.Dom.load`)              | <https://caniuse.com/#feat=fetch>             | <https://github.com/github/fetch>                  |

If custom elements v1 API is supported by browsers, it is very likely that other APIs are supported as well.

### Using npm

Do `npm i @sifrr/template @sifrr/dom` or `yarn add @sifrr/template @sifrr/dom` or add the package to your `package.json` file.

Put in your frontend js module (compatible with webpack/rollup/etc).

#### Importing

```js
// node require
const { setup } = require('@sifrr/dom');

// es6 module - supports both named and default export
import { setup } from '@sifrr/dom';
import SifrrDom from '@sifrr/dom';
const { setup } = SifrrDom;

// if using script tag
const { setup } = Sifrr.Dom;
```

## Basic API usage

### Setting Up

```js
// index.js

// Default Setup Config for Sifrr Dom
const config = {
  events: ['input', 'change', 'update'], // synthetic event listerners to add, read more in Synthetic Events section
  // config below will be used by `load` to figure out url of the element name given
  urls: {
    'element-name': '/element/name.js' // key-value pairs or element name and urls
  },
  url: null // function to get url of an element
};
// Set up Sifrr-Dom
Sifrr.Dom.setup(config);
```

### Sifrr element

```js
import { html } from '@sifrr/template';
import { Element } from '@sifrr/template';

class CustomTag extends Element {
  static get template() {
    return html`
      <style media="screen">
        p {
          color: blue;
        }
      </style>
      <p>${el => el.data()}</p>
    `; // el is the element instance
  }
  // other methods for the custom element
  data() {
    return this.getAttribute('data');
  }
}
Sifrr.Dom.register(CustomTag); // you should register in file itself to keep this file independently usable/downloadable
module.exports = CustomTag;
```

#### Template

`template` should be return value of `Sifrr.Template.html`. check out [sifrr-template](../sifrr-template) for more details.
Bindings work as it does in `Sifrr.Template`, difference being instead of props, `Sifrr.Dom` passes element itself in binding functions' first argument

#### Loading element

**Note**: `Sifrr.Dom.load` requires Fetch API to work.

1.  Sifrr.Dom.load() - downloads element file (recommended for async loading)

```js
// 3 ways to declare download url for an element with load

// key-value map
const config = {
  urls: {
    'custom-tag': '/custom-tag.js'
  }
};
Sifrr.Dom.load('custom-tag'); // downloads `/custom-tag.js`
// returns a promise resolved after loading the file

// url function
const config = {
  url: name => `/elements/${name}.js`
};
Sifrr.Dom.load('custom-tag'); // downloads `/elements/custom-tag.js`

// url in load
Sifrr.Dom.load('custom-tag', 'https://www.elements.com/custom-tag.js'); // download `https://www.elements.com/custom-tag.js`
```

Priority Order: `url` in load function call, url from `urls` in config, then url from `url` function.

```js
// controlling order of loading elements
class DependantElement extends Sifrr.Dom.Element {}

// `DependantElement` will be registered after `some-element` is loaded
Sifrr.Dom.load('some-element').then(() => {
  Sifrr.Dom.register(DependantElement);
});
```

2.  As module

```js
// index.html

<script type="module">
  import '/elements/custom-tag';
</script>
<script src="/elements/custom-tag" type="module">
```

3.  Normal script tag (recommended for best browser support)

```js
// index.html
<script src="/elements/custom-tag" />
```

#### Rendering

This html

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <title></title>
  </head>
  <body>
    <!-- Put custom tag anywhere to render that element -->
    <custom-tag></custom-tag>
    <script src="custom-tag.js" charset="utf-8"></script>
    <script src="index.js" charset="utf-8"></script>
  </body>
</html>
```

with

```js
// custom-tag.js

class CustomTag extends Element {
  static get template() {
    return html`
      <style media="screen">
        p {
          color: blue; // Only applies to p inside this element
        }
      </style>
      <p>${el => el.state.}</p>
      <p attr=${el => el.state.attribute}>${el => el.state.number}</p>
    `; // el is the element instance
  }

  constructor() {
    super();
    this.state = {
      number: 1,
      attribute: 'abcd'
    }
  }
}
Sifrr.Dom.register(CustomTag);
```

will render to

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <title></title>
  </head>
  <body>
    <custom-tag>
      #shadow-root
      <!-- Content will be rendered in shadow root by default -->
      <style media="screen">
        p {
          color: blue; // Only applies to p inside this element
        }
      </style>
      <p attr="abcd">1</p>
    </custom-tag>
    <script src="index.js" charset="utf-8"></script>
  </body>
</html>
```

#### Changing state of element

```js
const customtag = window.querySelector('custom-tag');
customtag.setState({ number: 2, attribute: 'xyz' });
// Note: state is functionally immutable, hence doing `customtag.state.id = 2` won't work
// You need to set state to new value every time you need to change state, but don't
// worry. Only new values provided are updated, other values remain same as they were.
```

This will change custom-tag to

```html
<custom-tag>
  #shadow-root
  <style media="screen">
    p {
      color: blue;
    }
  </style>
  <p attr="xyz">2</p>
</custom-tag>
```

Changing state automatically triggers `element.update()` which updates the bindings.

#### Force update element bindings

```js
customtag.update();
```

### Components Without shadow root

```html
<!-- ${baseUrl}/elements/custom/tag.html -->
<template>
  <style media="screen">
    // Style here will be global
  </style>
  <!-- content -->
</template>
<script type="text/javascript">
  class CustomTag {
    static get useShadowRoot {
      return false;
    }
  }
  // or
  CustomTag.useShadowRoot = false;
</script>
```

### props

- props do not trigger re-renders, unless set by `:` or `::` prop bindings of `Sifrr.Template`
- first argument in props binding function is parent sifrr element
- `:` or `::` prop bindings don't work when the element has no parent sifrr element
- props are case insensitive
- props in hyphen-case will be conveted to camel-case property name, i.e. `some-thing` => `someThing`

```html
<custom-tag :prop="${parentElement => parentElement.data}"></custom-tag>

<!-- then you can access property in customTag with `this.prop` -->
```

### Sifrr Element (Sifrr.Dom.Element) Methods

#### Callbacks

Sifrr wraps some of the original callbacks of Custom Elements API

```js
class CustomTag extends Sifrr.Dom.Element {
  // same as original
  static observedAttributes() {
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

  beforeUpdate() {
    // called before updates are rendered
  }

  onUpdate() {
    // called when element is updated
  }
}
```

#### Clearing state of element (use only if you know what you are doing)

```js
customtag.clearState(); // Not recommended to avoid blank/undefined bindings
```

#### Query selectors for custom element content

```js
// querySelector
customtag.$(selector /* shadowRoot = default: true if element uses shadow root else false */);
// querySelectorAll
customtag.$$(selector /* shadowRoot = default: true if element uses shadow root else false */);
// If shadowRoot is true, it selects elements inside element shadowRoot else it will select elements inside it
```

Sifrr adds $ and $\$ as alias for querySelector and querySelectorAll to all HTMLElements and document. eg. `document.$('div').$$('p')`

### Synthetic events

```js
// example for adding 'click' event listeners, can be replaced with any type of event (even custom events)

// Add synthetic event listerner (only need to be called once for one type of event)
// Can be given in options in Sifrr.Dom.Setup
Sifrr.Dom.Event.add('click');

// Adding event callback on an element (any html element), works inside shadowRoots also (for bubbling events)
// or `:_click` prop binding in Template
el._click = fxn;
// fxn will be called with two arguments `fxn(event, target)` and `this` inside function will be it's parent custom element if available, else window.

// Add _click attribute to html directly
// <a _click="console.log(this, event, target)"></a>

// Adding a generic event callback
Sifrr.Dom.Event.addListener('click', selector, fxn);
// or
Sifrr.Dom.Event.addListener('click', element, fxn);
// fxn will be called with same two arguments as before if event target matches the selector provided

// Triggering custom events
Sifrr.Dom.Event.trigger(target, 'custom:event', options);
// options are same as options for new window.Event(target, 'custom:event', options);
```

**Note**: Synthetic event listeners are always passive, hence, `event.preventDefault()` can not be called inside the function. Use html event listener properties (eg. `onclick`) if you need `event.preventDefault()`.

### More complex apis

#### Controlled inputs

```html
import { memo } from '@sifrr/template'

<!-- inside template -->
<input :value="${el => el.state.input}" :_input=${memo(el => value => el.setState({ input: value }))} />
<select :value="${el => el.state.select}" :_input=${memo(el => value => el.setState({ select: value }))}>
  <!-- options -->
</select>
<textarea :_input=${memo(el => value => el.setState({ textarea: value }))} :value=${el => el.state.textarea}></textarea>
<div contenteditable :_input=${memo(el => value => el.setState({ elements: value }))}>
  ${el => el.state.elements}
</div>

<!-- One Way bindings to value, updates value/content when state is changed -->
<!-- Use only :value prop without setting :_input_ -->

<!-- One Way bindings from value, updates state when value/content is changed (on input/change event) -->
<!-- Use only :_input prop without setting :value -->
```

#### Controlled State

```html
<!-- inside template -->
<!-- One Way bindings to `some-element`'s state, updates state of `some-element` when parent's state is changed -->
<some-element :state="${el => el.state.someElementState}"></some-element>

<!-- One Way bindings from `some-element`'s state, updates parent's state when state of `some-element` is changed -->
<some-element
  :_update="${Sifrr.Template.memo(el => newState => el.setState({ someElementState: newState }))}"
></some-element>

<!-- Both together -->
<!-- This automatically syncs parent's state.someElementState and `some-element`'s state' -->
<some-element
  :state="${el => el.state.someElementState}"
  :_update="${Sifrr.Template.memo(el => newState => el.setState({ someElementState: newState }))}"
></some-element>
```

#### Creating another sifrr element programmatically

`Sifrr.Dom.createElement(Sifrr.Dom.Element class or Tag name, props to be set, oldValue)`

```js
// example binding
`${(parent, oldValue) =>
  Sifrr.Dom.createElement(CustomTag || 'custom-tag', { prop: 'value' }, oldValue)}`;
```

#### Extending another html element (doesn't work in safari yet)

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

#### Global Stores

```js
import { html, Store } from '@sifrr/template';
import { Element } from '@sifrr/template';

// create a new store
const someStore = new Sifrr.Template.Store({ a: 'b' });

class CustomTag extends Element {
  static get template() {
    return html`
      <style media="screen">
        p {
          color: blue;
        }
      </style>
      <p>${() => someStore.value.a}</p>
    `; // el is the element instance
  }

  constructor() {
    super();
    someStore.addListener(() => {
      this.update(); // update this element whenevr stpre is updated
    });
  }
}
Sifrr.Dom.register(CustomTag); // you should register in file itself to keep this file independently usable/downloadable
module.exports = CustomTag;

// update value, now this will re-render all instances of CustomTag
someStore.set({ a: 'c' });
```

#### slots

- Slots work same as it would in web components, but note that bindings in slot elements won't work

## Example elements

- <https://github.com/sifrr/sifrr-elements>

## More readings

- <https://developers.google.com/web/fundamentals/web-components/customelements>

## Special thanks to

- <https://github.com/Freak613/stage0> for optimization bindings and reconciliation algorithm
- <https://github.com/krausest/js-framework-benchmark> for benchmarking performance, sifrr implementation was added [here](https://github.com/krausest/js-framework-benchmark/pull/503)
