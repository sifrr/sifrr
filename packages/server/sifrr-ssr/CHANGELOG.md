## [0.0.9](https://github.com/sifrr/sifrr/compare/v0.0.8...v0.0.9) (2020-12-21)



## [0.0.8](https://github.com/sifrr/sifrr/compare/v0.0.7...v0.0.8) (2020-11-12 15:25:53 +0000)



## [0.0.7](https://github.com/sifrr/sifrr/compare/v0.0.6...v0.0.7) (2020-11-10 16:57:32 +0000)



## [0.0.6](https://github.com/sifrr/sifrr/compare/v0.0.5...v0.0.6) (2019-07-27 19:15:42 +0000)


### Features

* make seo independent of overall design ([3fc918a](https://github.com/sifrr/sifrr/commit/3fc918ae9dd2eff6d08e2b00c46dbeb51a190b91))
* rename middleware to more specific express middleware ([528890a](https://github.com/sifrr/sifrr/commit/528890ad1c2b9f2be87d8b62bad4dd889d534783))



## [0.0.5](https://github.com/sifrr/sifrr/compare/v0.0.4...v0.0.5) (2019-05-20 17:36:45 +0900)


### Reverts

* Revert "feat(sifrr-dom): make deep twoway binding work" ([205936b](https://github.com/sifrr/sifrr/commit/205936bd4bae1b715867c126885ea145a4ffb1cf))



## [0.0.4](https://github.com/sifrr/sifrr/compare/v0.0.3...v0.0.4) (2019-04-08 01:10:18 +0900)


### Features

* limit browsers to 1 ([29941a1](https://github.com/sifrr/sifrr/commit/29941a196be2e7419669610ab2e8fa488eff9734))



## [0.0.3](https://github.com/sifrr/sifrr/compare/v0.0.1-alpha2...v0.0.3) (2019-03-05 23:44:39 +0900)


### Bug Fixes

* Don't return from cache if there is no cache ([68099e1](https://github.com/sifrr/sifrr/commit/68099e1232c103a47164f6fbf725994c929df58f))
* don't set footer in render ([938bba7](https://github.com/sifrr/sifrr/commit/938bba7d8d3a1f917d2e63158f65aa3637a5234c))
* Fix error on node 8 ([7db1ab2](https://github.com/sifrr/sifrr/commit/7db1ab220ea907d815fd9017f9d7e3cf7c4e6339))
* Fix pending resolver bug ([1db1e95](https://github.com/sifrr/sifrr/commit/1db1e95349ad0562664ab67b4d816c5a8e15dec5))
* Fix variables not parsing ([db201f5](https://github.com/sifrr/sifrr/commit/db201f568cc105b8ea2947be283b40cb262bf31a))
* Move puppeteer config to renderer ([59276a6](https://github.com/sifrr/sifrr/commit/59276a6180e687dcecd94a1c88aa21f897e92f74))
* Pass rendering error to express's next ([8663605](https://github.com/sifrr/sifrr/commit/8663605922182b84137f348bd65220ef9359ef20))


### Features

* Add beforeRender/afterRender functions ([7697596](https://github.com/sifrr/sifrr/commit/76975969b85e8ad021beafb86a8d70845202a90e))
* Add better caching, and way to use other caches like memcache/redis/etc ([b50fa18](https://github.com/sifrr/sifrr/commit/b50fa18b9b192ae4144131c927ec1976e89de005))
* Add capability to add puppeteer launch options ([dc56561](https://github.com/sifrr/sifrr/commit/dc56561507e9c11d307214c32a79b3a558e44503))
* Add footer to ssr html ([33d8783](https://github.com/sifrr/sifrr/commit/33d87837155207a2976db25366c9a12a4df58a03))
* Add option to blacklist outgoing requests (closes [#38](https://github.com/sifrr/sifrr/issues/38)) ([cad17f3](https://github.com/sifrr/sifrr/commit/cad17f304cd4de0b6ce4937e23f36ddd3aab0225))
* always get html fron localhost in puppeteer ([02fbe35](https://github.com/sifrr/sifrr/commit/02fbe35ddc3ed27cc7410c5f950c614e8b14b030))
* Decouple render method from middleware ([cff93ac](https://github.com/sifrr/sifrr/commit/cff93acda634f6ca8bbe67962cf719719f4d2a92))
* Don't load images and wait for xhr/fetch requests to complete ([f24172b](https://github.com/sifrr/sifrr/commit/f24172bfa6bc93be4c56c2e3c07f423fd1893cc7))
* Save if should render, in previous requests ([81fe753](https://github.com/sifrr/sifrr/commit/81fe7536e3ce28076e1a7812760f308055c6a6ef))
* Take cache store as cache parameter ([4a4a2d7](https://github.com/sifrr/sifrr/commit/4a4a2d7213a6c3cd8a2e6ae85ec91f1f169d9501))
* Take cacheKey as an option ([0455b2f](https://github.com/sifrr/sifrr/commit/0455b2f1ed619d656c69b46597756e4241a66781))
* Whitelist instead of blacklist ([4f03906](https://github.com/sifrr/sifrr/commit/4f03906ac18944a4adc3018b86661172d62764c3))


### Performance Improvements

* Always keep browser open and cache rendered html ([be70607](https://github.com/sifrr/sifrr/commit/be7060705a32539e44b732ba67b4b630dde93586))



## 0.0.1-alpha2 (2019-01-10 13:40:20 +0900)



