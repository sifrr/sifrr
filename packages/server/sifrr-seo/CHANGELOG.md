## [0.0.5](https://github.com/sifrr/sifrr/compare/v0.0.4...v0.0.5) (2019-05-19)


### Features




## [0.0.4](https://github.com/sifrr/sifrr/compare/v0.0.3...v0.0.4) (2019-04-07)


### Bug Fixes

* **sifrr-seo:** Fix error on node 8 ([7db1ab2](https://github.com/sifrr/sifrr/commit/7db1ab2))
* **sifrr-seo:** Fix pending resolver bug ([1db1e95](https://github.com/sifrr/sifrr/commit/1db1e95))
* Make babel.config.js work ([aedc697](https://github.com/sifrr/sifrr/commit/aedc697))
* **sifrr-seo:** Don't return from cache if there is no cache ([68099e1](https://github.com/sifrr/sifrr/commit/68099e1))
* **sifrr-seo:** don't set footer in render ([938bba7](https://github.com/sifrr/sifrr/commit/938bba7))
* **sifrr-seo:** Move puppeteer config to renderer ([59276a6](https://github.com/sifrr/sifrr/commit/59276a6))
* **sifrr-seo:** Pass rendering error to express's next ([8663605](https://github.com/sifrr/sifrr/commit/8663605))


### Features

* **sifrr-seo:** Add beforeRender/afterRender functions ([7697596](https://github.com/sifrr/sifrr/commit/7697596))
* **sifrr-seo:** Add better caching, and way to use other caches like memcache/redis/etc ([b50fa18](https://github.com/sifrr/sifrr/commit/b50fa18))
* **sifrr-seo:** Add capability to add puppeteer launch options ([dc56561](https://github.com/sifrr/sifrr/commit/dc56561))
* **sifrr-seo:** Add footer to ssr html ([33d8783](https://github.com/sifrr/sifrr/commit/33d8783))
* **sifrr-seo:** Add option to blacklist outgoing requests (closes [#38](https://github.com/sifrr/sifrr/issues/38)) ([cad17f3](https://github.com/sifrr/sifrr/commit/cad17f3))
* **sifrr-seo:** always get html fron localhost in puppeteer ([02fbe35](https://github.com/sifrr/sifrr/commit/02fbe35))
* **sifrr-seo:** Decouple render method from middleware ([cff93ac](https://github.com/sifrr/sifrr/commit/cff93ac))
* **sifrr-seo:** Don't load images and wait for xhr/fetch requests to complete ([f24172b](https://github.com/sifrr/sifrr/commit/f24172b))
* **sifrr-seo:** limit browsers to 1 ([29941a1](https://github.com/sifrr/sifrr/commit/29941a1))
* **sifrr-seo:** Save if should render, in previous requests ([81fe753](https://github.com/sifrr/sifrr/commit/81fe753))
* **sifrr-seo:** Take cache store as cache parameter ([4a4a2d7](https://github.com/sifrr/sifrr/commit/4a4a2d7))
* **sifrr-seo:** Take cacheKey as an option ([0455b2f](https://github.com/sifrr/sifrr/commit/0455b2f))
* **sifrr-seo:** Whitelist instead of blacklist ([4f03906](https://github.com/sifrr/sifrr/commit/4f03906))


### Performance Improvements

* **sifrr-seo:** Always keep browser open and cache rendered html ([be70607](https://github.com/sifrr/sifrr/commit/be70607))



