# sifrr-template · [![npm version](https://img.shields.io/npm/v/@sifrr/template.svg)](https://www.npmjs.com/package/@sifrr/template) [![Doscify](https://img.shields.io/badge/API%20docs-Docsify-red.svg)](https://sifrr.github.io/sifrr/#/./packages/browser/sifrr-template/)

A superfast HTML in JS Templating engine that powers @sifrr/dom. Inspired from `styled-components` api!

## Size

| Type               |                            Size                             |
| :----------------- | :---------------------------------------------------------: |
| Minified           |  ![](https://badgen.net/bundlephobia/min/@sifrr/template)   |
| Minified + Gzipped | ![](https://badgen.net/bundlephobia/minzip/@sifrr/template) |

## Features

- Written in TypeScript, usable in TypeScript as well as JavaScript
- Simple, fast and powerful templating engine
- Doesn't have props lifecycle management, use it as you wish
- Small learning curve, as you use only HTML, CSS, JS and maybe TS if you want
- Pure DOM bindings, without any virtual DOM
- still fast(er) than most of famous frameworks (just ~10-20% slower than vanillaJS)
- Low memory usage (just ~10-20% more than vanillaJS)
- Works without transpiling any code (no special syntax like jsx), and can be hosted with only a static server

## How to use

### Basic Usage

```js
const { html } = require('@sifrr/template'); // node require
import { html } from '@sifrr/template'; // es module
const { html } = Sifrr.Template; // if distribution files are used directly

// define a Component
const MainTemplate = html`
  <div>
    ${({ name }) => name}
  </div>
`;

// create a instance
const mainTemplateInstance = MainTemplate({ name: 'Aaditya' }); // returns `Node[]`
// new DOM nodes are created on create call

document.body.append(...mainTemplateInstance);
// this renders
// <div>Aaditya</div>
// inside body

// updating component instance
// pass old instance to your Component function as second argument
MainTemplate({ name: 'new name' }, mainTemplateInstance);
// this will update the rendered html to
// <div>new name</div>
// all bindings are recalculated and rendered if needed on update call
// Dom nodes are never recreated on update call, rather only the bindings are updated directly, which is very performant
```

### Bindings

The functions (`${({ name }) => name}`) in between your html template literal you passed to `html` function are called bindings.
Functions are not used, rather the return value of these functions are used.

First argument in binding function is `props` passed in when creating/updating component instance.
Second argument is oldValue (current dom nodes present or last returned value of this function) of that binding.

All arguments given in binding function are immutable. Avoid updating them, else there might be unintended effects.

There are three types of bindings:

#### 1. DOM bindings

Function passed inside dom, that renders dom nodes are DOM bindings.

```ts
// typescript typings
type DomBindingReturnValue =
  | null
  | undefined
  | string
  | Node
  | Node[]
  | NodeList
  | DomBindingReturnValue[];
(props: TemplateProps, oldValue: Nodes[]) => DomBindingReturnValue;
```

```js
html`
  <div>
    ${({ name }) => name}
  </div>
`;
// even async functions are fine
html`
  <div>
    ${async ({ name }) => fetch({...}}).then(data => data.name)}
  </div>
`;
```

#### 2. Attribute bindings

```js
html`
  <div name=${({ name }) => name}></div>
`; // async functions work here as well
```

Attribute name on div will have value = `name` from props passed

#### 3. Prop Bindings

- Normal prop bindings (prefixed with `:`)

return value of binding function is used

```js
html`
  <div id="divElement" :name=${({ name }) => name}></div>
`; // async functions work here as well

// now
document.querySelector('#divElement').name === props.name;
```

Prop name on div will have value = `name` from props passed.

- direct prop bindings (prefixed with `::`)

Sometimes you want to set prop value directly to the function given (for e.g. you want to set `onclick` prop on that element to the function provided).
Here you can use direct prop bindings

```js
html`
  <div
    id="divElement"
    ::style=${{ padding: '10px' }}
    ::onclick=${event => console.log(event.target)}
  ></div>
`;
```

here `div.onclick` will be equal to `event => console.log(event.target)` and style will be applied. Now click on this div will fire this function with click event.

**Notes**

- direct bindings are used as is and are never recalculated.
- direct binding only works with object and functions. so if you want to set a prop to constant string, you need to do `${() => 'value'}`, `${'value'}` doesn't work and will just set it as an attribute
- prop names are case insensitive and hyphen-case will be converted to camelCase. eg. `some-prop` will be `someProp` prop

### Advanced Usage

#### Using another Component in binding

maybe you want to break a Component into two parts that uses same props

```JavaScript
const HTML1 = html`
  <p>Name: ${({ name }) => name}</p>
`;

const HTML2 = html`
  <p>Address: ${({ address }) => address}</p>
`;

// combine
const CombinedHTML = html`
<div>
  <h4>User Info</h4>
  ${HTML1} // All props to `CombinedHTML` will be passed down to `HTML1` and `HTML2`
  ${HTML2}
</div>
`

// rendering
const renderHtml = CombinedHTML({ name: 'Aaditya', address: 'Tokyo' });
```

OR render a Component inside another Component

```JavaScript
const HTML1 = html`
  <p>Name: ${({ name }) => name}</p>
`;

const HTML2 = html`
  <p>Address: ${({ address }) => address}</p>
`;

// combine
const CombinedHTML = html`
<div>
  <h4>User Info</h4>
  ${({ firstName, lastName }) => HTML1({ name: firstName + lastName })} // pass modified props
  ${({ city, country }) => HTML2({ address: city + ',' + country })}
</div>
`

// rendering
const renderHtml = CombinedHTML({ firstName: 'Aaditya', lastName: 'Taparia', city: 'Tokyo', country: 'Japan' });
```

##### Optimizing Performance

By default new Component instance will be created whenever CombinedHTML is updated. But since we are only changing props, we can reuse old rendered instance and update that.
This is much more performant, since it only updates dom where needed, instead of replacing everything and creating new dom nodes.
You can do this by passing oldValue to Component creator function, and it will update old instance if present else create new instance.

```js
// combine
const CombinedHTML = html`

<div>
  <h4>User Info</h4>
  ${({ firstName, lastName }, oldValue) => HTML1({ name: firstName + lastName }, oldValue)} // pass modified props
  ${({ city, country }, oldValue) => HTML2({ address: city + ',' + country }, oldValue)}
</div>
```

This was already handled in first case where you were directly giving Component creator function in binding `${HTML1}`

#### CSS - special Component

```js
import { html, css } from '@sifrr/template';

const CSSForTemplate = css`
  p {
    color: ${({ color }) => color};
  }
`;

const HTML = html`
  ${CSSForTemplate} // all props from HTML will be passed down to CSSForTemplate when rendering just
  // like any other template
  <p>This text will be of ${({ color }) => color} color</p>
`;

const para = HTML({ color: 'red' });
// renders
// <style> --> style tags are automatically added
// p {
//   color: red;
// }
// </style>
// <p>This text will be of red color</p>

// updating
HTML({ color: 'blue' }, para); // you can guess what will happen
```

#### For Loop

- Normal

```js
import { html, css } from '@sifrr/template';

const Row = html`
  <tr>
    <td>${({ id }) => id}</td>
  </tr>
`;

// un-optimized
const Table = html`
  <table>
    ${({ data = [] }, oldValue) => data.map(d => Row(d))}
  </table>
`;

// optimized
const Table = html`
  <table>
    ${({ data = [] }, oldValue) => data.map((d, i) => Row(d, oldValue[i]))}
  </table>
`;

Table({ data: [{ id: '1' }, { id: '2' }] });
// will render
// <table>
//  <tr>
//  <td>1</td>
//  </tr>
//  <tr>
//  <td>2</td>
//  </tr>
// </table>
// when you update this instance with new data
// it will render update old rows if present, and add/remove rows if needed
```

- Non keyed (more performant than looping yourself)

```js
import { html, css, bindFor } from '@sifrr/template';

const Row = html`
  <tr>
    <td>${({ id }) => id}</td>
  </tr>
`;

const Table = html`
  <table>
    ${({ data = [] }, oldValue) => bindFor(Row, data, oldValue)}
  </table>
`;

Table({ data: [{ id: '1' }, { id: '2' }] });
// will render
// <table>
//  <tr>
//  <td>1</td>
//  </tr>
//  <tr>
//  <td>2</td>
//  </tr>
// </table>
// when you update this instance with new data
// it will render update old rows if present, and add/remove rows if needed
```

- Keyed (read more about keyed updates [here](https://reactjs.org/docs/reconciliation.html#keys))

Provide key prop in all array elements (equivalent to react's `key` prop)

```js
import { html, css, bindForKeyed } from '@sifrr/template';

const Row = html`
  <tr>
    <td>${({ id }) => id}</td>
  </tr>
`;

const Table = html`
  <table>
    ${({ data = [] }, oldValue) => bindForKeyed(Row, data, oldValue)}
  </table>
`;

Table({
  data: [
    { id: '1', key: 1 }, // this key will be compared during reconciliation
    { id: '2', key: 2 }
  ]
});
// will render
// <table>
//  <tr>
//  <td>1</td>
//  </tr>
//  <tr>
//  <td>2</td>
//  </tr>
// </table>
// but when you update this instance with new data
// it will reuse nodes with same key, and add/remove/update if needed
```

#### Memo

for some bindings you might want to only update when necessary, and not everytime. In such case you can use memo.
`memo` takes two arguments, 1st - binding function and 2nd - dependency array / key function

To be able to use `memo`, you need to keep identity of props same between updates. i.e. use same object and mutate that.

```js
import { memo } from '@sifrr/template';

html`
  <div
    :style=${memo(() => {
      padding: '10px';
    }, [])}
  ></div>
`; // only calculated once

html`
  <div
    :style=${memo(
      props => {
        display: props.visible ? 'block' : 'none';
      },
      ['visible']
    )}
  ></div>
`; // only calculated when props.visible changes, similarly you can give multiple prop keys in array and binding will be calculated only if any of those props change
// dependecies will be converted to strings for creating cache key, if you need to check for more complex prop you can
// provide your own cache key function
html`
  <div
    :style=${memo(
      props => {
        display: props.visible ? 'block' : 'none';
      },
      props => props.visible // key function, binding will be recalculated if cache key given by this function changes
    )}
  ></div>
`;
```

#### onPropChange

if any node has `onPropChange` property, it will be called with `(propName, oldValue, newValue)` whenever a prop binding on that node changes.

```js
html`
  <div
    :style=${memo(
      props => {
        display: props.visible ? 'block' : 'none';
      },
      props => props.visible
    )}
    :onclick=${memo(props => props.onDivClick, ['onDivClick'])}
    ::on-prop-change=${console.log}
  ></div>
`; // console.log will be called whenever style prop changes
```

#### Wrapping a Component / Higher Order Component

You can wrap a Component like this to create new component, just pass oldValue with props as well

```js
const ComponentA = html`
  ${({ name }) => name}
`;

// suspense like component, can be used directly in bindings easily
const ComponentB = async ({ userId }, oldValue) => {
  const name = await client.fetchUserName(userId);
  return ComponentA({ name }, oldValue /* remember to pass oldValue for performance */);
};
```

#### Async Components (can be used directly in bindings)

```js
// from above example
// append yourself
ComponentB({ userId: 1 }).then(els => document.body.append(...els));

// use in bindings
html`
  Name: ${({ user }, oldValue) => ComponentB({ userId: user.id }, oldValue)}
`;
```

#### Stores

```js
// create a new store
const someStore = new Sifrr.Template.Store({ a: 'b' });

const Template = Sifrr.Template.html`${() => someStore.value}`;

// get current value of store
someSore.value; // { initial: 'value' }

// update value
someStore.set({ a: 'c' });

const temp = Template({}); // renders `b`

// add a listener on store value update
someStore.addListener(() => {
  // do somthing
  // this function will be called whenever store is updated
  Template({}, temp); // update temp instance with new store values, will render `c`
});
```

#### Unique classname styling (like styled-components)

```js
import { html, styled } from '@sifrr/template';

const { css, className } = styled`
    color: red;
`;

const HTML = html`
  ${css} // a component class from `css` function
  <p class="${className}">This text will be of red color</p>
`;
```

Note that classname will be applied to all components so should be used with that in mind (binding value in css will be changed for all component instances).

### Tips

- Don't create new Template in a function, doing this will create new template on every function call.

```js
// bad
function some({ name }) {
  // do something
  return html`
    <p></p>
  `({});
}

// good
const HTML = html`
  <p></p>
`;
function some({ name }) {
  // do something
  return HTML({});
}
```

- Since the changes in dom are per binding based, try to keep each binding as independent as possible. So, in future it will be easier to extract out the binding into a new component.

- Order in which bindings are calculated is not fixed, so don't bet on it

- use memo and oldvalue passing for max performance

```jsx
// in react you would generally do
// recreates component on every change in loading
loading ? <Loader /> : <SomeComponent />;

// in sifrr you would do
// recreates component on every change in loading
html`
  ${({ loading }) => (loading ? Loader() : SomeComponent())}
`;

// and for max performance
// reuses old component if available on change in loading
html`
  ${memo(({ loading }) => (loading ? Loader() : SomeComponent()), ['loading'])}
`;

// don't memo for simple bindings which are fast already eg. `${({ text }) => text}`
```

```jsx
// in react you would do
// updates old dom
<Loader prop1={prop1} />;

// in sifrr you would do
// recreates component on every update, slow
html`
  ${({ prop1 }) => Loader({ prop1 }))}
`;

// recreates component on every update in prop1, a bit better
html`
  ${memo(({ prop1 }) => Loader({ prop1 }), ['prop1'])}
`;

// reuses old component if available on change in loading
html`
  ${({ prop1 }, oldValue) => Loader({prop1}, oldValue))}
`; // note that this only works when you are returning same component everytime (which is recommended)
```

- Binding functions can use any javascript object/variable from outside, and the context will be retained on every update
  eg.

```js
let i = 0;

html`
  ${() => i++}
`; // renders i and increases i on every update
```
