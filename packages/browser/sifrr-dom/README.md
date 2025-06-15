# sifrr-dom · [![npm version](https://img.shields.io/npm/v/@sifrr/dom.svg)](https://www.npmjs.com/package/@sifrr/dom) [![Doscify](https://img.shields.io/badge/API%20docs-Docsify-red.svg)](https://sifrr.github.io/sifrr/#/./packages/browser/sifrr-dom/)

A ~6KB :zap: fast DOM framework for creating web user interfaces using Custom Elements with state management, one way/two way data bindings etc.

Sifrr-Dom is best of both worlds: write components in pure HTML, CSS, JS with ease-of-use and features of a full fledged JS framework like css scoping (shadow root), events, reconciliation etc.

## Size

| Type                                         |                          Size                          |
| :------------------------------------------- | :----------------------------------------------------: |
| Minified (`dist/sifrr.dom.min.js`)           |  ![](https://badgen.net/bundlephobia/min/@sifrr/dom)   |
| Minified + Gzipped (`dist/sifrr.dom.min.js`) | ![](https://badgen.net/bundlephobia/minzip/@sifrr/dom) |

## Tradeoffs

- :+1: Uses @sifrr/template and adds custom elements, prop management on top of it
- :+1: Use latest web API standards (custom elements v1)
- :+1: CSS scoping with shadow root
- :-1: hence will not work in older browsers without [polyfills](#browser-api-support-needed-for)

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

If custom elements v1 API is supported by browsers, it is very likely that other APIs are supported as well.

### Using npm

Do `npm i @sifrr/template @sifrr/dom` or `yarn add @sifrr/template @sifrr/dom` or add the package to your `package.json` file.

Put in your frontend js module (compatible with webpack/rollup/etc).

#### Importing

```js
// node require
const SifrrDom = require('@sifrr/dom');

// es6 module - supports both named and default export
import SifrrDom from '@sifrr/dom';

// if using script tag
Sifrr.Dom;
```

## Basic API usage

### Sifrr element

```js
import { html } from '@sifrr/template';
import { Element } from '@sifrr/dom';

class CustomTag extends Element {
  static get template() {
    return html`
      <style media="screen">
        p {
          color: blue;
        }
      </style>
      <p>${(el) => el.data()}</p>
      <button @click=${(el) => () => el.context.count++}>
        Click to increase${(el) => el.context.count}
      </button>
    `; // el is the element instance
  }
  // other methods for the custom element
  data() {
    return this.getAttribute('data');
  }
  // can setup anything to be run before component is created
  // and return value will be used as context, context is a reactive object so element is re-rendered whenever any of it's properties changes
  setup() {
    const count = 0;
    const deep = {
      a: 'reactive'
    };

    // value returned is set as this.context
    return {
      count,
      deep
    };
  }
}
Sifrr.Dom.register(CustomTag); // you should register in file itself to keep this file independently usable
module.exports = CustomTag;
```

#### Template

`template` should be return value of `Sifrr.Template.html`. check out [sifrr-template](../sifrr-template/README.md) for more details.
Bindings work as it does in `Sifrr.Template`, difference being instead of props, `Sifrr.Dom` passes element itself in binding functions' first argument

#### Loading element

1.  As ES6 module import

```js
// use in any other component
import { html } from '@sifrr/template';
import { Element } from '@sifrr/dom';
import CustomTag from './elements/custom-tag'

class CustomParent extends Element {
  static components = [CustomTag]

  static template = html`
      <custom-tag :prop=${el => el.data()}></custom-tab>
    `; // el is the element instance

  data() {
    return this.getAttribute('data');
  }
}
Sifrr.Dom.register(CustomParent); // you can register in file itself to keep this file independently usable
module.exports = CustomParent;

// index.html
<script type="module">
  import '/elements/custom-tag';
</script>
<script src="/elements/custom-tag" type="module">
```

3.  Normal script tag

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
      <p>${(el) => el.state.number}</p>
      <p attr=${(el) => el.state.attribute}>${(el) => el.state.number}</p>
    `; // el is the element instance
  }

  constructor() {
    super();
    this.state = {
      number: 1,
      attribute: 'abcd'
    };
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

#### Force re-render element

```js
customtag.update();
```

### Components Without shadow root

```js
class CustomTag {
  constructor() {
    super({
      useShadowRoot: false
    });
  }
}
```

### props

You can define props for an element like this:

```ts
class CustomCount extends Element {
  // Note prop decorator is needed if you need to access property on first render,
  // else browser removes props when element is connected
  @Prop()
  count!: number;

  static get template() {
    return html` <p>${(el) => el.count}</p> `; // el is the element instance
  }

  constructor() {
    super();
  }
}
```

and then in some other element

```js
class ParentElement extends Element {
  static get template() {
    return html`
      <custom-count :count=${() => 5} /p>
    `; // el is the element instance
    // this will render
    // <custom-count><p>5</p></custom-count>
  }

  constructor() {
    super();
  }
}
```

- props do not trigger re-renders, unless set by `:` or `::` prop bindings of `Sifrr.Template`, call `element.setProps(props)` to re-render programatically
- first argument in props binding function is parent sifrr element
- `:` or `::` prop bindings only works inside sifrr elements
- props are case insensitive
- props in hyphen-case will be converted to camel-case property name, i.e. `some-thing` => `someThing`

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
    // called when element is disconnected from dom
  }

  onAttributeChange(attrName, oldVal, newVal) {
    // called when an attribute in observedAttrs array is changed
  }

  onPropChange(name, oldValue, newValue) {
    // called when element's prop is changed
  }

  beforeUpdate() {
    // called before element is re-rendered (note it's not called on first render, use setup to do stuff before first render and constructor to do stuff after first render)
  }

  onUpdate() {
    // called after element is re-rendered (note it's not called on first render, use setup to do stuff before first render and constructor to do stuff after first render)
  }
}
```

#### Query selectors for custom element content

```js
// querySelector
customtag.$s(selector /* searches in shadowroot if element uses shadow root else normally */);
// querySelectorAll
customtag.$$s(selector /* searches in shadowroot if element uses shadow root else normally */);
// if you do not want to select in shadow root, you can use normal methods
customtag.$(selector);
customtag.$$(selector);
```

`Sifrr.Dom.setup()` adds $ and $\$ as alias for querySelector and querySelectorAll to all HTMLElements and document. eg. `document.$('div').$$('p')`

### More complex apis

#### Controlled inputs

```js
import { memo } from '@sifrr/template';
import { Element } from '@sifrr/dom';

class ControlledInputs extends Element {
  static template = html` <input
      :value="${(el) => el.context.input}"
      @input=${memo((el) => (evt) => (el.context.input = evt.target.value))}
    />
    <select
      :value="${(el) => el.context.select}"
      @change=${memo((el) => (evt) => (el.context.select = evt.target.value))}
    >
      <!-- options -->
    </select>
    <textarea
      @input=${memo((el) => (evt) => (el.context.textarea = evt.target.value))}
      :value=${(el) => el.context.textarea}
    ></textarea>
    <div
      contenteditable
      @input=${memo((el) => (evt) => (el.context.elements = evt.target.textContent))}
    >
      ${(el) => el.context.elements}
    </div>`;

  setup() {
    return {
      input: 'input',
      select: 'a',
      textarea: `text\narea`,
      elements: '<p>paragraph</p>'
    };
  }
}
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
import { html, ref } from '@sifrr/template';
import { Element } from '@sifrr/template';

// create a new store
const someStore = new Sifrr.Template.ref({ a: 'b' });

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
    this.watch(someStore);
  }
}
Sifrr.Dom.register(CustomTag);
module.exports = CustomTag;

// update value, now this will re-render all instances of CustomTag
someStore.set({ a: 'c' });
```

#### slots

- Slots work same as it would in web components, but note that bindings in slot will be from element where slots are defined

## Example elements

- <https://github.com/sifrr/sifrr-elements>

## More readings

- <https://developers.google.com/web/fundamentals/web-components/customelements>

## Special thanks to

- <https://github.com/Freak613/stage0> for reconciliation algorithm
- <https://github.com/krausest/js-framework-benchmark> for benchmarking performance, sifrr implementation was added [here](https://github.com/krausest/js-framework-benchmark/pull/503)
