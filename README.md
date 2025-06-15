<h1 align="center"> <img src="./logo/sifrr-logo.svg" width="256" alt="sifrr" name="sifrr"> </h1>
<p align="center">
  <a href="https://github.com/sifrr/sifrr/blob/master/LICENSE"><a href="https://opencollective.com/sifrr-oc" alt="Financial Contributors on Open Collective"><img src="https://opencollective.com/sifrr-oc/all/badge.svg?label=financial+contributors" /></a> <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="GitHub license" /></a>
  <a href="https://circleci.com/gh/sifrr/sifrr"><img alt="CircleCI (all branches)" src="https://img.shields.io/circleci/project/github/sifrr/sifrr/master.svg?logo=circleci&style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@sifrr/dom"><img src="https://img.shields.io/npm/v/@sifrr/dom.svg?style=flat-square" alt="npm version" /></a>
  <a href="./misc/CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-Welcome-green.svg?style=flat-square" alt="PRs Welcome" /></a>
  <a href="https://app.fossa.com/projects/git%2Bgithub.com%2Fsifrr%2Fsifrr?ref=badge_small" alt="FOSSA Status"><img src="https://app.fossa.com/api/projects/git%2Bgithub.com%2Fsifrr%2Fsifrr.svg?type=small"/></a>
  <a href="https://coveralls.io/github/sifrr/sifrr?branch=master"><img src="https://img.shields.io/coveralls/github/sifrr/sifrr.svg?style=flat-square" alt="Coverage Status" /></a>
  <a href="https://dependabot.com/"><img src="https://badgen.net/badge/Dependabot/enabled/green?icon=dependabot" alt="Dependabot badge" /></a>
  <a href="https://lgtm.com/projects/g/sifrr/sifrr/alerts/"><img alt="LGTM" src="https://img.shields.io/lgtm/grade/javascript/g/sifrr/sifrr.svg?logo=lgtm&style=flat-square&logoWidth=18" /></a>
</p>
<p align="center">
  <a href="https://sifrr.github.io/sifrr/">Documentation</a> | <a href="./CHANGELOG.md">Changelog</a> | <a href="./misc/CONTRIBUTORS">Contributors</a> | <a href="./misc/CONTRIBUTING.md">Contributing guidelines</a> | <a href="./misc/CODE_OF_CONDUCT.md">Code of Conduct</a>
</p>

---

> sifrr is a set of tiny, customizable, independent libraries for creating modern and fast webapps using JavaScript.

## Repository Info

This repository is a monorepo managed using yarn workspaces. This means there are [multiple packages](#packages) managed in this codebase, even though they are published to NPM as separate packages. They will always have same latest version and are released together.

Note that for 0.x releases of this library, the API is not considered stable yet and may break between minor releases. After 1.0, Semantic Versioning will be followed.

## Packages

### Browser (VanillaJS)

| Package                                                        | Description                                                                                                    | NPM                                                                                                                         | Documentation                                                                                                                                  |                       Tests                       |
| :------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- | :-----------------------------------------------: |
| [sifrr-dom](./packages/browser/sifrr-dom/)                     | Small Library to build UIs with custom elements                                                                | [![npm version](https://img.shields.io/npm/v/@sifrr/dom.svg)](https://www.npmjs.com/package/@sifrr/dom)                     | [![Doscify](https://img.shields.io/badge/API%20docs-Docsify-red.svg)](https://sifrr.github.io/sifrr/#/./packages/browser/sifrr-dom/)           |      [OK](./packages/browser/sifrr-dom/test)      |
| [sifrr-template](./packages/browser/sifrr-template/)           | :zap: Fast HTML-JS Templating engine used in sifrr-dom                                                         | [![npm version](https://img.shields.io/npm/v/@sifrr/template.svg)](https://www.npmjs.com/package/@sifrr/template)           | [![Doscify](https://img.shields.io/badge/API%20docs-Docsify-red.svg)](https://sifrr.github.io/sifrr/#/./packages/browser/sifrr-template/)      |   [OK](./packages/browser/sifrr-template/test)    |
| [sifrr-fetch](./packages/browser/sifrr-fetch/)                 | Wrapper library for Browser fetch API can be used in node too                                                  | [![npm version](https://img.shields.io/npm/v/@sifrr/fetch.svg)](https://www.npmjs.com/package/@sifrr/fetch)                 | [![Doscify](https://img.shields.io/badge/API%20docs-Docsify-red.svg)](https://sifrr.github.io/sifrr/#/./packages/browser/sifrr-fetch/)         |     [OK](./packages/browser/sifrr-fetch/test)     |
| [sifrr-route](./packages/browser/sifrr-route/)                 | Routing for sifrr-dom                                                                                          | [![npm version](https://img.shields.io/npm/v/@sifrr/route.svg)](https://www.npmjs.com/package/@sifrr/route)                 | [![Doscify](https://img.shields.io/badge/API%20docs-Docsify-red.svg)](https://sifrr.github.io/sifrr/#/./packages/browser/sifrr-route/)         |     [OK](./packages/browser/sifrr-route/test)     |
| [sifrr-serviceworker](./packages/browser/sifrr-serviceworker/) | Service worker wrapper library                                                                                 | [![npm version](https://img.shields.io/npm/v/@sifrr/serviceworker.svg)](https://www.npmjs.com/package/@sifrr/serviceworker) | [![Doscify](https://img.shields.io/badge/API%20docs-Docsify-red.svg)](https://sifrr.github.io/sifrr/#/./packages/browser/sifrr-serviceworker/) | [OK](./packages/browser/sifrr-serviceworker/test) |
| [sifrr-storage](./packages/browser/sifrr-storage/)             | Browser persisted storage library (2kb alternate to [localforage](https://github.com/localForage/localForage)) | [![npm version](https://img.shields.io/npm/v/@sifrr/storage.svg)](https://www.npmjs.com/package/@sifrr/storage)             | [![Doscify](https://img.shields.io/badge/API%20docs-Docsify-red.svg)](https://sifrr.github.io/sifrr/#/./packages/browser/sifrr-storage/)       |    [OK](./packages/browser/sifrr-storage/test)    |

`sifrr-dom`, `sifrr-template`, `sifrr-fetch`, `sifrr-serviceworker`, `sifrr-storage` can be used independently. `sifrr-route` is a `sifrr-dom` element, hence it should be used with `sifrr-dom`.

### Server (NodeJS)

| Package                                         | Description                                            | NPM                                                                                                           | Documentation                                                                                                                          |                   Tests                   |
| :---------------------------------------------- | :----------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------: |
| [sifrr-ssr](./packages/server/sifrr-ssr/)       | Server side pre-rendering using puppeteer with caching | [![npm version](https://img.shields.io/npm/v/@sifrr/ssr.svg)](https://www.npmjs.com/package/@sifrr/ssr)       | [![Doscify](https://img.shields.io/badge/API%20docs-Docsify-red.svg)](https://sifrr.github.io/sifrr/#/./packages/server/sifrr-ssr/)    |  [OK](./packages/server/sifrr-ssr/test)   |
| [sifrr-server](./packages/server/sifrr-server/) | Fast HTTP + WebSockets server                          | [![npm version](https://img.shields.io/npm/v/@sifrr/server.svg)](https://www.npmjs.com/package/@sifrr/server) | [![Doscify](https://img.shields.io/badge/API%20docs-Docsify-red.svg)](https://sifrr.github.io/sifrr/#/./packages/server/sifrr-server/) | [OK](./packages/server/sifrr-server/test) |

## Usage

All the packages can be used with node, es6 modules, and are compatible with bundler of your choice (rollup, webpack, browserify)

### commonJS (node)

```js
const SifrrDom = require('@sifrr/dom');
```

### ES6 modules (`import`)

```js
import SifrrDom from '@sifrr/dom'; // default export
import { Element } from '@sifrr/dom'; // named export
```

### standalone distributions (browser packages only)

For eg.

```html
<script src="https://unpkg.com/@sifrr/dom@{version}/dist/index.iife.js"></script>
// for v0.0.9
<script src="https://unpkg.com/@sifrr/dom@0.0.9/dist/index.iife.js"></script>
// this sets window.Sifrr.Dom as sifrr-dom, same for other packages
```

### Packages that have tests have a working example of that package in `test/public` folder

## Node support (server packages and development)

Sifrr officially supports node v10, v12 (LTS), v13 (current). Other versions might work for some packages.

## Browser Support (browser packages)

Sifrr browser packages officially supports these browser versions (for dist files):

| Browser               | Version |
| :-------------------- | :------ |
| Chrome                | >= 55   |
| Android Chrome        | >= 55   |
| Firefox               | >= 63   |
| Android Firefox       | >= 63   |
| Opera                 | >= 42   |
| Safari                | >= 10.1 |
| Safari (iOS browsers) | >= 10.1 |

Individual libraries may support older versions too with polyfills listed in docs, or by bundling it with polyfills using babel etc.

Approximately amounts to ~90% of total worldwide browser usage.

To support mini browsers (opera mini, uc browser etc.), You can use sifrr-ssr to provide server side rendering.

## Contributors

### Code Contributors

This project exists thanks to all the people who contribute. [[Contribute](./misc/CONTRIBUTING.md)].
<a href="https://github.com/sifrr/sifrr/graphs/contributors"><img src="https://opencollective.com/sifrr-oc/contributors.svg?width=890&button=false" /></a>

### Financial Contributors

Become a financial contributor and help us sustain our community. [[Contribute](https://opencollective.com/sifrr-oc/contribute)]

#### Individuals

<a href="https://opencollective.com/sifrr-oc"><img src="https://opencollective.com/sifrr-oc/individuals.svg?width=890"></a>

#### Organizations

Support this project with your organization. Your logo will show up here with a link to your website. [[Contribute](https://opencollective.com/sifrr-oc/contribute)]

<a href="https://opencollective.com/sifrr-oc/organization/0/website"><img src="https://opencollective.com/sifrr-oc/organization/0/avatar.svg"></a>
<a href="https://opencollective.com/sifrr-oc/organization/1/website"><img src="https://opencollective.com/sifrr-oc/organization/1/avatar.svg"></a>
<a href="https://opencollective.com/sifrr-oc/organization/2/website"><img src="https://opencollective.com/sifrr-oc/organization/2/avatar.svg"></a>
<a href="https://opencollective.com/sifrr-oc/organization/3/website"><img src="https://opencollective.com/sifrr-oc/organization/3/avatar.svg"></a>
<a href="https://opencollective.com/sifrr-oc/organization/4/website"><img src="https://opencollective.com/sifrr-oc/organization/4/avatar.svg"></a>
<a href="https://opencollective.com/sifrr-oc/organization/5/website"><img src="https://opencollective.com/sifrr-oc/organization/5/avatar.svg"></a>
<a href="https://opencollective.com/sifrr-oc/organization/6/website"><img src="https://opencollective.com/sifrr-oc/organization/6/avatar.svg"></a>
<a href="https://opencollective.com/sifrr-oc/organization/7/website"><img src="https://opencollective.com/sifrr-oc/organization/7/avatar.svg"></a>
<a href="https://opencollective.com/sifrr-oc/organization/8/website"><img src="https://opencollective.com/sifrr-oc/organization/8/avatar.svg"></a>
<a href="https://opencollective.com/sifrr-oc/organization/9/website"><img src="https://opencollective.com/sifrr-oc/organization/9/avatar.svg"></a>

## License

Sifrr is [MIT Licensed](./LICENSE).

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fsifrr%2Fsifrr.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fsifrr%2Fsifrr?ref=badge_large)

(c) [@aadityataparia](https://github.com/aadityataparia)
