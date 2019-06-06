## [0.0.5](https://github.com/sifrr/sifrr/compare/v0.0.4...v0.0.5) (2019-05-20 17:36:45 +0900)



## [0.0.4](https://github.com/sifrr/sifrr/compare/v0.0.3...v0.0.4) (2019-04-08 01:10:18 +0900)


### Features

* limit browsers to 1 ([29941a1](https://github.com/sifrr/sifrr/commit/29941a1))



## [0.0.3](https://github.com/sifrr/sifrr/compare/v0.0.1-alpha2...v0.0.3) (2019-03-05 23:44:39 +0900)


### Bug Fixes

* Don't return from cache if there is no cache ([68099e1](https://github.com/sifrr/sifrr/commit/68099e1))
* don't set footer in render ([938bba7](https://github.com/sifrr/sifrr/commit/938bba7))
* Fix error on node 8 ([7db1ab2](https://github.com/sifrr/sifrr/commit/7db1ab2))
* Fix pending resolver bug ([1db1e95](https://github.com/sifrr/sifrr/commit/1db1e95))
* Fix variables not parsing ([db201f5](https://github.com/sifrr/sifrr/commit/db201f5))
* Move puppeteer config to renderer ([59276a6](https://github.com/sifrr/sifrr/commit/59276a6))
* Pass rendering error to express's next ([8663605](https://github.com/sifrr/sifrr/commit/8663605))


### Features

* Add beforeRender/afterRender functions ([7697596](https://github.com/sifrr/sifrr/commit/7697596))
* Add better caching, and way to use other caches like memcache/redis/etc ([b50fa18](https://github.com/sifrr/sifrr/commit/b50fa18))
* Add capability to add puppeteer launch options ([dc56561](https://github.com/sifrr/sifrr/commit/dc56561))
* Add footer to ssr html ([33d8783](https://github.com/sifrr/sifrr/commit/33d8783))
* Add option to blacklist outgoing requests (closes [#38](https://github.com/sifrr/sifrr/issues/38)) ([cad17f3](https://github.com/sifrr/sifrr/commit/cad17f3))
* always get html fron localhost in puppeteer ([02fbe35](https://github.com/sifrr/sifrr/commit/02fbe35))
* Decouple render method from middleware ([cff93ac](https://github.com/sifrr/sifrr/commit/cff93ac))
* Don't load images and wait for xhr/fetch requests to complete ([f24172b](https://github.com/sifrr/sifrr/commit/f24172b))
* Save if should render, in previous requests ([81fe753](https://github.com/sifrr/sifrr/commit/81fe753))
* Take cache store as cache parameter ([4a4a2d7](https://github.com/sifrr/sifrr/commit/4a4a2d7))
* Take cacheKey as an option ([0455b2f](https://github.com/sifrr/sifrr/commit/0455b2f))
* Whitelist instead of blacklist ([4f03906](https://github.com/sifrr/sifrr/commit/4f03906))


### Performance Improvements

* Always keep browser open and cache rendered html ([be70607](https://github.com/sifrr/sifrr/commit/be70607))



## 0.0.1-alpha2 (2019-01-10 13:40:20 +0900)



