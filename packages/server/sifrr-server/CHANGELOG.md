## [0.0.6](https://github.com/sifrr/sifrr/compare/v0.0.4...v0.0.6) (2019-07-27)


### Bug Fixes

* abort passing stream when compressed ([7462264](https://github.com/sifrr/sifrr/commit/7462264))
* fix mutable headers issue ([026c675](https://github.com/sifrr/sifrr/commit/026c675))
* return this after close ([e992c38](https://github.com/sifrr/sifrr/commit/e992c38))


### Features

* add createCluster function ([98bca3a](https://github.com/sifrr/sifrr/commit/98bca3a))
* add graphql server to sifrr-server ([d5efcc2](https://github.com/sifrr/sifrr/commit/d5efcc2))
* add livereload feature (experimental) ([fb1005b](https://github.com/sifrr/sifrr/commit/fb1005b))
* add option to change filename for tmpdir ([c2a9330](https://github.com/sifrr/sifrr/commit/c2a9330))
* add optional caching  ([#106](https://github.com/sifrr/sifrr/issues/106)) ([cf74306](https://github.com/sifrr/sifrr/commit/cf74306))
* add options to overwrite/fail on dup static route ([c515745](https://github.com/sifrr/sifrr/commit/c515745))
* cache works for compressed file as well ([c0821e0](https://github.com/sifrr/sifrr/commit/c0821e0))
* change ext methods to mimes/getMime ([724ecb5](https://github.com/sifrr/sifrr/commit/724ecb5))
* clone connection with same resolver if none given ([a3ef846](https://github.com/sifrr/sifrr/commit/a3ef846))
* close watchers on server close ([0cca0a1](https://github.com/sifrr/sifrr/commit/0cca0a1))
* make compress: false as default ([af95e82](https://github.com/sifrr/sifrr/commit/af95e82))
* make live reload js importable ([9c29147](https://github.com/sifrr/sifrr/commit/9c29147))
* update uWS.js to 15.11.0 ([dc81e97](https://github.com/sifrr/sifrr/commit/dc81e97))



## [0.0.4](https://github.com/sifrr/sifrr/compare/v0.0.3...v0.0.4) (2019-04-08 01:10:18 +0900)


### Bug Fixes

* content-length for ranged responses ([6612526](https://github.com/sifrr/sifrr/commit/6612526))
* don't extend constructor ([9038a1e](https://github.com/sifrr/sifrr/commit/9038a1e))
* fix serving from basePath ([4d04976](https://github.com/sifrr/sifrr/commit/4d04976))
* write headers after compression ([fdd4958](https://github.com/sifrr/sifrr/commit/fdd4958))


### Features

* add capability to serve single file ([6852531](https://github.com/sifrr/sifrr/commit/6852531))
* add close method ([ea85bfd](https://github.com/sifrr/sifrr/commit/ea85bfd))
* add compression ([509e1dd](https://github.com/sifrr/sifrr/commit/509e1dd))
* add load routes function ([7618070](https://github.com/sifrr/sifrr/commit/7618070))
* add post body parsing (json, form data) ([560244f](https://github.com/sifrr/sifrr/commit/560244f))
* add static server with last-modified based 304 ([4540e93](https://github.com/sifrr/sifrr/commit/4540e93))
* delegate to uws app, add static serving method ([8bc9fa6](https://github.com/sifrr/sifrr/commit/8bc9fa6))
* don't send headers on 304 ([1702009](https://github.com/sifrr/sifrr/commit/1702009))
* handle connection closing, streaming ([0762cb7](https://github.com/sifrr/sifrr/commit/0762cb7))
* inherit from uws Apps ([330d85a](https://github.com/sifrr/sifrr/commit/330d85a))
* make sendFile async ([f26cc9d](https://github.com/sifrr/sifrr/commit/f26cc9d))
* only use last modified if set to true ([ed39a1a](https://github.com/sifrr/sifrr/commit/ed39a1a))
* serve in ranges of ranges header present ([3658eab](https://github.com/sifrr/sifrr/commit/3658eab))
* watch for new files and deleted files ([2752d48](https://github.com/sifrr/sifrr/commit/2752d48))
* watch only when option given ([5ef7703](https://github.com/sifrr/sifrr/commit/5ef7703))


### Performance Improvements

* clone from typedarray ([abea750](https://github.com/sifrr/sifrr/commit/abea750))
* directly use stream in form data and body ([0af7fb9](https://github.com/sifrr/sifrr/commit/0af7fb9))
* make stream to buffer more efficient ([1d16c9d](https://github.com/sifrr/sifrr/commit/1d16c9d))



## [0.0.3](https://github.com/sifrr/sifrr/compare/v0.0.1-alpha2...v0.0.3) (2019-03-05 23:44:39 +0900)



## 0.0.1-alpha2 (2019-01-10 13:40:20 +0900)



