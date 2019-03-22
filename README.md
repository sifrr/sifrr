<h1 align="center"> <img src="./logo/sifrr-logo.svg" width="256" alt="sifrr" name="sifrr"> </h1>
<p align="center">
  <a href="https://github.com/sifrr/sifrr/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="GitHub license" /></a>
  <a href="https://circleci.com/gh/sifrr/sifrr"><img src="https://circleci.com/gh/sifrr/sifrr.svg?style=shield" alt="CircleCI" /></a>
  <a href="https://www.npmjs.com/package/@sifrr/dom"><img src="https://img.shields.io/npm/v/@sifrr/dom.svg" alt="npm version" /></a>
  <a href="./misc/CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-Not%20yet-red.svg" alt="No PRs yet" /></a>
  <a href="https://app.fossa.io/projects/git%2Bgithub.com%2Fsifrr%2Fsifrr?ref=badge_shield"><img src="https://app.fossa.io/api/projects/git%2Bgithub.com%2Fsifrr%2Fsifrr.svg?type=shield" alt="FOSSA Status" /></a>
  <a href="https://greenkeeper.io/"><img src="https://badges.greenkeeper.io/sifrr/sifrr.svg" alt="Greenkeeper badge" /></a>
  <a href="https://coveralls.io/github/sifrr/sifrr?branch=master"><img src="https://coveralls.io/repos/github/sifrr/sifrr/badge.svg?branch=master" alt="Coverage Status" /></a>
  <a href="https://www.codacy.com/app/aadityataparia/sifrr"><img src="https://api.codacy.com/project/badge/Grade/c7e9c6f6e0734118abb68f9d59529b73" alt="Codacy Badge" /></a>
</p>
<p align="center">
<a href="./misc/CHANGELOG.md">Changelog</a> | <a href="./misc/CONTRIBUTORS">Contributors</a> | <a href="./misc/CONTRIBUTING.md">Contributing guidelines</a> | <a href="./misc/CODE_OF_CONDUCT.md">Code of Conduct</a>
</p>

* * *

> sifrr is a set of customizable, independent libraries for creating modern and fast webapps.

## Repository Info

This repository is a monorepo managed using yarn workspaces. This means there are [multiple packages](#packages) managed in this codebase, even though they are published to NPM as separate packages. They will always have same latest version and are released together.

## Packages

### Browser (VanillaJS)

| Package                                                       | Description                                                    | NPM                                                                                                                         | Documentation                                                                                                         |                       Tests                       |
| :------------------------------------------------------------ | :------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------- | :-----------------------------------------------: |
| [sifrr-dom](./packages/browser/sifrr-dom)                     | Small and :zap: Fast Library to build UIs with custom elements | [![npm version](https://img.shields.io/npm/v/@sifrr/dom.svg)](https://www.npmjs.com/package/@sifrr/dom)                     | [![In Readme](https://img.shields.io/badge/API%20docs-Readme-red.svg)](./packages/browser/sifrr-dom#readme)           |      [OK](./packages/browser/sifrr-dom/test)      |
| [sifrr-fetch](./packages/browser/sifrr-fetch)                 | Wrapper library for Browser fetch API                          | [![npm version](https://img.shields.io/npm/v/@sifrr/fetch.svg)](https://www.npmjs.com/package/@sifrr/fetch)                 | [![In Readme](https://img.shields.io/badge/API%20docs-Readme-red.svg)](./packages/browser/sifrr-fetch#readme)         |     [OK](./packages/browser/sifrr-fetch/test)     |
| [sifrr-route](./packages/browser/sifrr-route)                 | Routing for sifrr-dom                                          | [![npm version](https://img.shields.io/npm/v/@sifrr/route.svg)](https://www.npmjs.com/package/@sifrr/route)                 | [![In Readme](https://img.shields.io/badge/API%20docs-Readme-red.svg)](./packages/browser/sifrr-route#readme)         |     [OK](./packages/browser/sifrr-route/test)     |
| [sifrr-serviceworker](./packages/browser/sifrr-serviceworker) | Service worker wrapper library                                 | [![npm version](https://img.shields.io/npm/v/@sifrr/serviceworker.svg)](https://www.npmjs.com/package/@sifrr/serviceworker) | [![In Readme](https://img.shields.io/badge/API%20docs-Readme-red.svg)](./packages/browser/sifrr-serviceworker#readme) | [OK](./packages/browser/sifrr-serviceworker/test) |
| [sifrr-storage](./packages/browser/sifrr-storage)             | Browser persisted storage library                              | [![npm version](https://img.shields.io/npm/v/@sifrr/storage.svg)](https://www.npmjs.com/package/@sifrr/storage)             | [![In Readme](https://img.shields.io/badge/API%20docs-Readme-red.svg)](./packages/browser/sifrr-storage#readme)       |    [OK](./packages/browser/sifrr-storage/test)    |

`sifrr-dom`, `sifrr-fetch`, `sifrr-serviceworker`, `sifrr-storage` can be used independently. `sifrr-route` is a `sifrr-dom` element, hence it should be used with `sifrr-dom`.

### Server (NodeJS)

| Package                                        | Description                                            | NPM                                                                                                           | Documentation                                                                                                 |                   Tests                   |
| :--------------------------------------------- | :----------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------ | :---------------------------------------: |
| [sifrr-api](./packages/server/sifrr-api)       | Create normal/GraphQL APIs with same codebase          | [![npm version](https://img.shields.io/npm/v/@sifrr/api.svg)](https://www.npmjs.com/package/@sifrr/api)       | [![In Readme](https://img.shields.io/badge/API%20docs-Readme-red.svg)](./packages/server/sifrr-api#readme)    |   [OK](./packages/server/sifrr-api/test)  |
| [sifrr-cli](./packages/server/sifrr-cli)       | Sifrr cli for creating webapps using sifrr             | [![npm version](https://img.shields.io/npm/v/@sifrr/cli.svg)](https://www.npmjs.com/package/@sifrr/cli)       | [![In Readme](https://img.shields.io/badge/API%20docs-Readme-red.svg)](./packages/server/sifrr-cli#readme)    |                   \[WIP]                  |
| [sifrr-seo](./packages/server/sifrr-seo)       | Server side pre-rendering using puppeteer with caching | [![npm version](https://img.shields.io/npm/v/@sifrr/seo.svg)](https://www.npmjs.com/package/@sifrr/seo)       | [![In Readme](https://img.shields.io/badge/API%20docs-Readme-red.svg)](./packages/server/sifrr-seo#readme)    |   [OK](./packages/server/sifrr-seo/test)  |
| [sifrr-server](./packages/server/sifrr-server) | Fast HTTP + WebSockets server                          | [![npm version](https://img.shields.io/npm/v/@sifrr/server.svg)](https://www.npmjs.com/package/@sifrr/server) | [![In Readme](https://img.shields.io/badge/API%20docs-Readme-red.svg)](./packages/server/sifrr-server#readme) | [OK](./packages/server/sifrr-server/test) |

`sifrr-api`, `sifrr-seo` can be used independently. `sifrr-cli` has functionalities which can be used with sequelize projects, `sifrr-api` projects and `sifrr-dom` projects.

## Usage

All the packages can be used with requireJS (node's `require` syntax) and module syntax (`import`)
Browser packages have standalone distribution as well, which can be used directly in browser with link tags.

### Packages that have tests have a working example of that package in `test/public` folder

## Node support (server packages and development)

Sifrr officially supports node v10 (LTS), v11 (current). Other versions might work for some packages.

| Node Version | CI Status                                                                                                                |
| :----------- | :----------------------------------------------------------------------------------------------------------------------- |
| v11          | [![](https://travis-matrix-badges.herokuapp.com/repos/sifrr/sifrr/branches/master/1)](https://travis-ci.org/sifrr/sifrr) |
| v10          | [![](https://travis-matrix-badges.herokuapp.com/repos/sifrr/sifrr/branches/master/2)](https://travis-ci.org/sifrr/sifrr) |

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

Individual libraries may support older versions too with polyfills listed in readmes, or by bundling it with polyfills using babel etc.

Approximately amounts to > 80% of total worldwide browser usage.

To support mini browsers (opera mini, uc browser etc.), You can use sifrr-seo to provide server side rendering.

## License

Sifrr is [MIT Licensed](./LICENSE).

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fsifrr%2Fsifrr.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fsifrr%2Fsifrr?ref=badge_large)

(c) [@aadityataparia](https://github.com/aadityataparia)
