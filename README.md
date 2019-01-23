# sifrr · [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/sifrr/sifrr/blob/master/LICENSE) [![CircleCI](https://circleci.com/gh/sifrr/sifrr.svg?style=shield)](https://circleci.com/gh/sifrr/sifrr) [![npm version](https://img.shields.io/npm/v/@sifrr/dom.svg)](https://www.npmjs.com/package/@sifrr/dom) [![No PRs yet](https://img.shields.io/badge/PRs-Not%20yet-red.svg)](<>) [![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fsifrr%2Fsifrr.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fsifrr%2Fsifrr?ref=badge_shield)

sifrr is a set of libraries for creating modern webapps.

## Packages

### Browser

| Package                                                       | Description                                                                                   | NPM                                                                                                                         | Documentation                                       |                       Tests                       |
| :------------------------------------------------------------ | :-------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------- | :-----------------------------------------------: |
| [sifrr-dom](./packages/browser/sifrr-dom)                     | A &lt; 5KB DOM library using Custom Elements, one way/two way data binding, faster than react | [![npm version](https://img.shields.io/npm/v/@sifrr/dom.svg)](https://www.npmjs.com/package/@sifrr/dom)                     | [In Readme](./packages/browser/sifrr-dom)           |                       [WIP]                       |
| [sifrr-fetch](./packages/browser/sifrr-fetch)                 | Wrapper library for Browser fetch API                                                         | [![npm version](https://img.shields.io/npm/v/@sifrr/fetch.svg)](https://www.npmjs.com/package/@sifrr/fetch)                 | [In Readme](./packages/browser/sifrr-fetch)         |     [OK](./packages/browser/sifrr-fetch/test)     |
| [sifrr-route](./packages/browser/sifrr-route)                 | Routing for sifrr-dom                                                                         | [![npm version](https://img.shields.io/npm/v/@sifrr/route.svg)](https://www.npmjs.com/package/@sifrr/route)                 | [In Readme](./packages/browser/sifrr-route)         |     [OK](./packages/browser/sifrr-route/test)     |
| [sifrr-serviceworker](./packages/browser/sifrr-serviceworker) | Service worker wrapper library                                                                | [![npm version](https://img.shields.io/npm/v/@sifrr/serviceworker.svg)](https://www.npmjs.com/package/@sifrr/serviceworker) | [In Readme](./packages/browser/sifrr-serviceworker) | [OK](./packages/browser/sifrr-serviceworker/test) |
| [sifrr-storage](./packages/browser/sifrr-storage)             | Browser persisted storage library                                                             | [![npm version](https://img.shields.io/npm/v/@sifrr/storage.svg)](https://www.npmjs.com/package/@sifrr/storage)             | [In Readme](./packages/browser/sifrr-storage)       |    [OK](./packages/browser/sifrr-storage/test)    |

`sifrr-dom`, `sifrr-fetch`, `sifrr-serviceworker`, `sifrr-storage` can be used independently. `sifrr-route` is a `sifrr-dom` element, hence it should be used with `sifrr-dom`.

### Server

| Package                                  | Description                                                                          | NPM                                                                                                     | Documentation                            | Tests |
| :--------------------------------------- | :----------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------ | :--------------------------------------- | :---: |
| [sifrr-api](./packages/server/sifrr-api) | Create normal/GraphQL APIs using sequelize/graphql-sequelize/express                 | [![npm version](https://img.shields.io/npm/v/@sifrr/api.svg)](https://www.npmjs.com/package/@sifrr/api) | [In Readme](./packages/server/sifrr-api) | [WIP] |
| [sifrr-cli](./packages/server/sifrr-cli) | Sifrr cli for creating webapps using sifrr                                           | [![npm version](https://img.shields.io/npm/v/@sifrr/cli.svg)](https://www.npmjs.com/package/@sifrr/cli) | [In Readme](./packages/server/sifrr-cli) | [WIP] |
| [sifrr-seo](./packages/server/sifrr-seo) | Connect/Express Middleware for serving pre-rendered html to crawl bots/lite browsers | [![npm version](https://img.shields.io/npm/v/@sifrr/seo.svg)](https://www.npmjs.com/package/@sifrr/seo) | [In Readme](./packages/server/sifrr-seo) | [WIP] |

`sifrr-api`, `sifrr-seo` can be used independently. `sifrr-cli` has functionalities which can be used with sequelize projects, `sifrr-api` projects and `sifrr-dom` projects.

#### Packages that have tests have a working example of that package in `test/public` folder.

## Node support

Sifrr officially supports node v9 and higher (for packages and for development). Other versions should work as well with some limitations (mostly regarding development).

| Node Version | CI                                                                                                                    |
| :----------- | :----------------------------------------------------------------------------------------------------------------------- |
| v11          | [![](https://travis-matrix-badges.herokuapp.com/repos/sifrr/sifrr/branches/master/1)](https://travis-ci.org/sifrr/sifrr) |
| v10          | [![](https://travis-matrix-badges.herokuapp.com/repos/sifrr/sifrr/branches/master/2)](https://travis-ci.org/sifrr/sifrr) |
| v9           | [![](https://travis-matrix-badges.herokuapp.com/repos/sifrr/sifrr/branches/master/3)](https://travis-ci.org/sifrr/sifrr) |

## Contributing

[Contributing](docs/CONTRIBUTING.md) \| [Contributors](docs/AUTHORS)
[WIP]

## License

Sifrr is [MIT Licensed](./LICENSE).

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fsifrr%2Fsifrr.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fsifrr%2Fsifrr?ref=badge_large)

(c) [@aadityataparia](https://github.com/aadityataparia)
