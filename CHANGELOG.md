## 0.0.5 (2019-06-05 18:04:38 +0900)


### Bug Fixes

* **sifrr-fetch:** don't set content type if body is not json object ([695b588](https://github.com/sifrr/sifrr/commit/695b588))
* **sifrr-server:** abort passing stream when compressed ([7462264](https://github.com/sifrr/sifrr/commit/7462264))
* **sifrr-server:** fix mutable headers issue ([026c675](https://github.com/sifrr/sifrr/commit/026c675))
* **sifrr-server:** return this after close ([e992c38](https://github.com/sifrr/sifrr/commit/e992c38))
* **sifrr-storage:** fix bug of not returning falsy values in indexeddb ([5dd8521](https://github.com/sifrr/sifrr/commit/5dd8521))
* **sifrr-storage:** fix typed array and blob support ([357ee65](https://github.com/sifrr/sifrr/commit/357ee65))
* **sifrr-storage:** store = correctly in cookies ([06544a8](https://github.com/sifrr/sifrr/commit/06544a8))


### Features

* **sifrr-api:** association works in sequelize create resolver ([b1e354e](https://github.com/sifrr/sifrr/commit/b1e354e))
* **sifrr-api:** make connection query work ([4f753c0](https://github.com/sifrr/sifrr/commit/4f753c0))
* **sifrr-cli:** update to use import syntax ([81e0f34](https://github.com/sifrr/sifrr/commit/81e0f34))
* **sifrr-dom:** add basic hooks ([f5208e1](https://github.com/sifrr/sifrr/commit/f5208e1))
* **sifrr-dom:** add js execution function ([0186437](https://github.com/sifrr/sifrr/commit/0186437))
* **sifrr-dom:** add Listener can take element as well ([e7662d4](https://github.com/sifrr/sifrr/commit/e7662d4))
* **sifrr-dom:** add root reference in repeated refs ([d5fbd62](https://github.com/sifrr/sifrr/commit/d5fbd62))
* **sifrr-dom:** add syncedAttrs ([d9dc170](https://github.com/sifrr/sifrr/commit/d9dc170))
* **sifrr-dom:** add two way binding between element states ([bd20eab](https://github.com/sifrr/sifrr/commit/bd20eab))
* **sifrr-dom:** don't give error if element has no state ([e99e5ea](https://github.com/sifrr/sifrr/commit/e99e5ea))
* **sifrr-dom:** make deep twoway binding work ([d9ba844](https://github.com/sifrr/sifrr/commit/d9ba844))
* **sifrr-dom:** make hooks work with other types, array too ([c068fb3](https://github.com/sifrr/sifrr/commit/c068fb3))
* **sifrr-dom:** set connected status for element ([014df65](https://github.com/sifrr/sifrr/commit/014df65))
* **sifrr-dom:** set global sifrr.dom on setup ([4335bbd](https://github.com/sifrr/sifrr/commit/4335bbd))
* **sifrr-dom:** strings also work as element template ([bf96a41](https://github.com/sifrr/sifrr/commit/bf96a41))
* **sifrr-dom:** template can take (html, style) as argument ([2a17d08](https://github.com/sifrr/sifrr/commit/2a17d08))
* **sifrr-dom:** warn if name already taken ([098d54e](https://github.com/sifrr/sifrr/commit/098d54e))
* **sifrr-fetch:** add before and after hooks ([9619e41](https://github.com/sifrr/sifrr/commit/9619e41))
* **sifrr-fetch:** add more progress options ([d674726](https://github.com/sifrr/sifrr/commit/d674726))
* **sifrr-fetch:** add speed as second parameter in onProgress fxn ([10d0419](https://github.com/sifrr/sifrr/commit/10d0419))
* **sifrr-fetch:** add use hook ([7f3e6b8](https://github.com/sifrr/sifrr/commit/7f3e6b8))
* **sifrr-fetch:** take fallback function as parameter in wsfetch ([52743b3](https://github.com/sifrr/sifrr/commit/52743b3))
* **sifrr-fetch:** take options in fallback paramete in ws ([b0d76e2](https://github.com/sifrr/sifrr/commit/b0d76e2))
* **sifrr-route:** add events on activation and deactivation ([16a8911](https://github.com/sifrr/sifrr/commit/16a8911))
* **sifrr-route:** add json support in data-sifrr-elements ([fc48a62](https://github.com/sifrr/sifrr/commit/fc48a62))
* **sifrr-route:** don't add Route to Dom, add to Sifrr.Route ([8bde333](https://github.com/sifrr/sifrr/commit/8bde333))
* **sifrr-seo:** make seo independent of overall design ([3fc918a](https://github.com/sifrr/sifrr/commit/3fc918a))
* **sifrr-seo:** rename middleware to more specific express middleware ([528890a](https://github.com/sifrr/sifrr/commit/528890a))
* **sifrr-server:** add option to change filename for tmpdir ([c2a9330](https://github.com/sifrr/sifrr/commit/c2a9330))
* **sifrr-server:** add optional caching  ([#106](https://github.com/sifrr/sifrr/issues/106)) ([cf74306](https://github.com/sifrr/sifrr/commit/cf74306))
* **sifrr-server:** add options to overwrite/fail on dup static route ([c515745](https://github.com/sifrr/sifrr/commit/c515745))
* **sifrr-server:** cache works for compressed file as well ([c0821e0](https://github.com/sifrr/sifrr/commit/c0821e0))
* **sifrr-server:** change ext methods to mimes/getMime ([724ecb5](https://github.com/sifrr/sifrr/commit/724ecb5))
* **sifrr-server:** clone connection with same resolver if none given ([a3ef846](https://github.com/sifrr/sifrr/commit/a3ef846))
* **sifrr-server:** make compress: false as default ([af95e82](https://github.com/sifrr/sifrr/commit/af95e82))
* **sifrr-storage:** add keys() method ([d23ea59](https://github.com/sifrr/sifrr/commit/d23ea59))
* **sifrr-storage:** add support for ArrayBuffer, TypedArray data types ([40b62e9](https://github.com/sifrr/sifrr/commit/40b62e9))
* **sifrr-storage:** refactor cookies to support larger data ([00ae6c8](https://github.com/sifrr/sifrr/commit/00ae6c8))


### Performance Improvements

* **sifrr-dom:** cache text node values ([45e6531](https://github.com/sifrr/sifrr/commit/45e6531))
* **sifrr-dom:** iterate backwards in arrays ([fe5efa5](https://github.com/sifrr/sifrr/commit/fe5efa5))
* **sifrr-dom:** trigger update only when there is listener ([6a736d9](https://github.com/sifrr/sifrr/commit/6a736d9))
* **sifrr-dom:** use array state maps for events and attributes ([cfdd514](https://github.com/sifrr/sifrr/commit/cfdd514))
* **sifrr-storage:** add speed tests ([323dbdf](https://github.com/sifrr/sifrr/commit/323dbdf))
* **sifrr-storage:** improve performance of localstorage ([8254ca1](https://github.com/sifrr/sifrr/commit/8254ca1))
* **sifrr-storage:** use outer keys instead of inline keys ([04291c3](https://github.com/sifrr/sifrr/commit/04291c3))



## [0.0.4](https://github.com/sifrr/sifrr/compare/v0.0.3...v0.0.4) (2019-04-08 01:10:18 +0900)


### Bug Fixes

* **sifrr-dom:** fix event error message ([70c510f](https://github.com/sifrr/sifrr/commit/70c510f))
* **sifrr-dom:** remove dependency on isHtml from nextNode ([2e116d7](https://github.com/sifrr/sifrr/commit/2e116d7))
* **sifrr-dom:** use diff TW in different creators ([bc05b8f](https://github.com/sifrr/sifrr/commit/bc05b8f))
* **sifrr-fetch:** don't set content-type if already set ([e9509c8](https://github.com/sifrr/sifrr/commit/e9509c8))
* tests ([afabbe9](https://github.com/sifrr/sifrr/commit/afabbe9))
* **sifrr-dom:** fix keyed couldn't add elements in front ([efbced4](https://github.com/sifrr/sifrr/commit/efbced4))
* **sifrr-dom:** only bind event attribute if it has ${} ([2bc019e](https://github.com/sifrr/sifrr/commit/2bc019e))
* **sifrr-dom:** treat repeating elements as html bindings ([96103d6](https://github.com/sifrr/sifrr/commit/96103d6))
* **sifrr-server:** content-length for ranged responses ([6612526](https://github.com/sifrr/sifrr/commit/6612526))
* **sifrr-server:** don't extend constructor ([9038a1e](https://github.com/sifrr/sifrr/commit/9038a1e))
* **sifrr-server:** fix serving from basePath ([4d04976](https://github.com/sifrr/sifrr/commit/4d04976))
* **sifrr-server:** write headers after compression ([fdd4958](https://github.com/sifrr/sifrr/commit/fdd4958))


### Features

* **sifrr-cli:** remove db:reset setup tasks ([9bbd829](https://github.com/sifrr/sifrr/commit/9bbd829))
* **sifrr-dom:** add before update callback ([d136c8f](https://github.com/sifrr/sifrr/commit/d136c8f))
* **sifrr-dom:** add error if event listener is not added ([6170c73](https://github.com/sifrr/sifrr/commit/6170c73))
* **sifrr-dom:** don't clear if there are no childnodes ([dec0909](https://github.com/sifrr/sifrr/commit/dec0909))
* **sifrr-dom:** exec scripts in order ([59247f6](https://github.com/sifrr/sifrr/commit/59247f6))
* **sifrr-dom:** execute js in order ([f19879e](https://github.com/sifrr/sifrr/commit/f19879e))
* **sifrr-dom:** expose makeequal fxns ([026821d](https://github.com/sifrr/sifrr/commit/026821d))
* **sifrr-dom:** improve two-way binding and script loader ([8aa3a2d](https://github.com/sifrr/sifrr/commit/8aa3a2d))
* **sifrr-dom:** make function execution async ([2eee675](https://github.com/sifrr/sifrr/commit/2eee675))
* **sifrr-dom:** remove dependency on sifrr-fetch, use fetch ([1c64ec0](https://github.com/sifrr/sifrr/commit/1c64ec0))
* **sifrr-dom:** simplify sifrrClone and deep clone intelligently ([9819ab3](https://github.com/sifrr/sifrr/commit/9819ab3))
* **sifrr-dom:** trigger update event on updated element ([ff64ae2](https://github.com/sifrr/sifrr/commit/ff64ae2))
* **sifrr-fetch:** add close method ([db5578c](https://github.com/sifrr/sifrr/commit/db5578c))
* **sifrr-fetch:** add fallback for graphql websockets ([ebb9f31](https://github.com/sifrr/sifrr/commit/ebb9f31))
* **sifrr-fetch:** add graphql websockets ([b68c5a8](https://github.com/sifrr/sifrr/commit/b68c5a8))
* **sifrr-fetch:** don't set options except redirect ([7bb0c7c](https://github.com/sifrr/sifrr/commit/7bb0c7c))
* **sifrr-fetch:** only stringify if body is js object ([cdd858b](https://github.com/sifrr/sifrr/commit/cdd858b))
* **sifrr-seo:** limit browsers to 1 ([29941a1](https://github.com/sifrr/sifrr/commit/29941a1))
* **sifrr-server:** add capability to serve single file ([6852531](https://github.com/sifrr/sifrr/commit/6852531))
* **sifrr-server:** add close method ([ea85bfd](https://github.com/sifrr/sifrr/commit/ea85bfd))
* **sifrr-server:** add compression ([509e1dd](https://github.com/sifrr/sifrr/commit/509e1dd))
* **sifrr-server:** add load routes function ([7618070](https://github.com/sifrr/sifrr/commit/7618070))
* **sifrr-server:** add post body parsing (json, form data) ([560244f](https://github.com/sifrr/sifrr/commit/560244f))
* **sifrr-server:** add static server with last-modified based 304 ([4540e93](https://github.com/sifrr/sifrr/commit/4540e93))
* **sifrr-server:** delegate to uws app, add static serving method ([8bc9fa6](https://github.com/sifrr/sifrr/commit/8bc9fa6))
* **sifrr-server:** don't send headers on 304 ([1702009](https://github.com/sifrr/sifrr/commit/1702009))
* **sifrr-server:** handle connection closing, streaming ([0762cb7](https://github.com/sifrr/sifrr/commit/0762cb7))
* **sifrr-server:** inherit from uws Apps ([330d85a](https://github.com/sifrr/sifrr/commit/330d85a))
* **sifrr-server:** make sendFile async ([f26cc9d](https://github.com/sifrr/sifrr/commit/f26cc9d))
* **sifrr-server:** only use last modified if set to true ([ed39a1a](https://github.com/sifrr/sifrr/commit/ed39a1a))
* **sifrr-server:** serve in ranges of ranges header present ([3658eab](https://github.com/sifrr/sifrr/commit/3658eab))
* **sifrr-server:** watch for new files and deleted files ([2752d48](https://github.com/sifrr/sifrr/commit/2752d48))
* **sifrr-server:** watch only when option given ([5ef7703](https://github.com/sifrr/sifrr/commit/5ef7703))


### Performance Improvements

* **sifrr-dom:** directly access _state to avoid function call ([9ba19d2](https://github.com/sifrr/sifrr/commit/9ba19d2))
* **sifrr-dom:** improve event listeners ([8381454](https://github.com/sifrr/sifrr/commit/8381454))
* **sifrr-dom:** update property for class,id,value attribute ([215fd7a](https://github.com/sifrr/sifrr/commit/215fd7a))
* **sifrr-server:** clone from typedarray ([abea750](https://github.com/sifrr/sifrr/commit/abea750))
* **sifrr-server:** directly use stream in form data and body ([0af7fb9](https://github.com/sifrr/sifrr/commit/0af7fb9))
* **sifrr-server:** make stream to buffer more efficient ([1d16c9d](https://github.com/sifrr/sifrr/commit/1d16c9d))



## [0.0.3](https://github.com/sifrr/sifrr/compare/v0.0.1-alpha2...v0.0.3) (2019-03-05 23:44:39 +0900)


### Bug Fixes

* **package:** update yargs to version 13.1.0 ([#39](https://github.com/sifrr/sifrr/issues/39)) ([7789b21](https://github.com/sifrr/sifrr/commit/7789b21))
* **sifrr-api:** default base path is added before each route ([54b1c8e](https://github.com/sifrr/sifrr/commit/54b1c8e))
* **sifrr-cli:** Don't use use-shadow-root attribute ([d56a6c8](https://github.com/sifrr/sifrr/commit/d56a6c8))
* **sifrr-dom:** Add listener on window instead of document ([bfda60b](https://github.com/sifrr/sifrr/commit/bfda60b))
* **sifrr-dom:** Don't add script to body except src ones ([638c53b](https://github.com/sifrr/sifrr/commit/638c53b))
* **sifrr-dom:** Don't make text content empty when disconnecting ([f1e3b1e](https://github.com/sifrr/sifrr/commit/f1e3b1e))
* **sifrr-dom:** Don't treat style attribute differently ([aacb43e](https://github.com/sifrr/sifrr/commit/aacb43e))
* **sifrr-dom:** fix clear perfornmace ([9a96838](https://github.com/sifrr/sifrr/commit/9a96838))
* **sifrr-dom:** Fix repeat with sifrr element bug ([ea295b3](https://github.com/sifrr/sifrr/commit/ea295b3))
* **sifrr-dom:** Fix sifrr-element in simple-element bug ([7fb0c82](https://github.com/sifrr/sifrr/commit/7fb0c82))
* **sifrr-dom:** Fix target in event listener fxn execution ([bc899f6](https://github.com/sifrr/sifrr/commit/bc899f6))
* **sifrr-dom:** Fix Treewalker loop bug ([b88d792](https://github.com/sifrr/sifrr/commit/b88d792))
* **sifrr-dom:** Make TW filter fxn simpler ([711a24a](https://github.com/sifrr/sifrr/commit/711a24a))
* **sifrr-dom:** remove no content option, but make it work without any template ([27d0579](https://github.com/sifrr/sifrr/commit/27d0579))
* **sifrr-dom:** Remove redundant checking for attribute specified ([6c6ada9](https://github.com/sifrr/sifrr/commit/6c6ada9))
* **sifrr-dom:** Remove redundant checking for node exists ([c1a767f](https://github.com/sifrr/sifrr/commit/c1a767f))
* **sifrr-dom:** Remove relativeTo method ([75741ed](https://github.com/sifrr/sifrr/commit/75741ed))
* **sifrr-dom:** Removes attribute if value is falsy ([c268e3c](https://github.com/sifrr/sifrr/commit/c268e3c))
* **sifrr-dom:** Show element name whose js it is fetching ([efe96d2](https://github.com/sifrr/sifrr/commit/efe96d2))
* **sifrr-dom:** sifrr element not rendering in arrayToDom ([f9f1749](https://github.com/sifrr/sifrr/commit/f9f1749))
* **sifrr-dom:** Throw error if element already defined ([c15eed9](https://github.com/sifrr/sifrr/commit/c15eed9))
* **sifrr-dom:** Throw error on register element error ([bdfdac5](https://github.com/sifrr/sifrr/commit/bdfdac5))
* **sifrr-dom:** Try to get js file before html ([db49c8f](https://github.com/sifrr/sifrr/commit/db49c8f))
* **sifrr-dom:** Use shadyCSS if available, and don't use use-shadow-root attribute ([4db2e10](https://github.com/sifrr/sifrr/commit/4db2e10))
* **sifrr-route:** Directly assign state of element instead of attribute ([2046c35](https://github.com/sifrr/sifrr/commit/2046c35))
* **sifrr-route:** Don't use history API when not available ([7ecf792](https://github.com/sifrr/sifrr/commit/7ecf792))
* **sifrr-route:** Show no animation by default ([a182e6d](https://github.com/sifrr/sifrr/commit/a182e6d))
* **sifrr-route:** Use composed path instead of path to support safari ([ace938f](https://github.com/sifrr/sifrr/commit/ace938f))
* **sifrr-seo:** Don't return from cache if there is no cache ([68099e1](https://github.com/sifrr/sifrr/commit/68099e1))
* **sifrr-seo:** don't set footer in render ([938bba7](https://github.com/sifrr/sifrr/commit/938bba7))
* **sifrr-seo:** Fix error on node 8 ([7db1ab2](https://github.com/sifrr/sifrr/commit/7db1ab2))
* **sifrr-seo:** Fix pending resolver bug ([1db1e95](https://github.com/sifrr/sifrr/commit/1db1e95))
* **sifrr-seo:** Fix variables not parsing ([db201f5](https://github.com/sifrr/sifrr/commit/db201f5))
* **sifrr-seo:** Move puppeteer config to renderer ([59276a6](https://github.com/sifrr/sifrr/commit/59276a6))
* **sifrr-seo:** Pass rendering error to express's next ([8663605](https://github.com/sifrr/sifrr/commit/8663605))
* **sifrr-storage:** Check for openDatabase in webSQL ([d92d437](https://github.com/sifrr/sifrr/commit/d92d437))
* **sifrr-storage:** Replace unnecessary let with const ([5396521](https://github.com/sifrr/sifrr/commit/5396521))
* Make babel.config.js work ([aedc697](https://github.com/sifrr/sifrr/commit/aedc697))
* **sifrr-storage:** Return null if null ([aa8e7ba](https://github.com/sifrr/sifrr/commit/aa8e7ba))


### Features

* **sifrr-api:** Add description ([e1075ca](https://github.com/sifrr/sifrr/commit/e1075ca))
* **sifrr-api:** Add schema saving to file ([1f299fc](https://github.com/sifrr/sifrr/commit/1f299fc))
* **sifrr-api:** Only edit schema file if content has changed ([e2de504](https://github.com/sifrr/sifrr/commit/e2de504))
* **sifrr-api:** separate model and connection and implement relay ([6b64627](https://github.com/sifrr/sifrr/commit/6b64627))
* **sifrr-cli:** Update element:generate to create js ([cebe29a](https://github.com/sifrr/sifrr/commit/cebe29a))
* **sifrr-dom:** Add $ & $$ to all elements, fix make equal call ([b7c21b3](https://github.com/sifrr/sifrr/commit/b7c21b3))
* **sifrr-dom:** Add awesome event handling and use _ instead of $ in attribute name ([166f48c](https://github.com/sifrr/sifrr/commit/166f48c))
* **sifrr-dom:** Add dom argument to event listener ([c96a66b](https://github.com/sifrr/sifrr/commit/c96a66b))
* **sifrr-dom:** Add keyed implementation ([#48](https://github.com/sifrr/sifrr/issues/48)) ([e2155d4](https://github.com/sifrr/sifrr/commit/e2155d4))
* **sifrr-dom:** Add on update hook ([021d027](https://github.com/sifrr/sifrr/commit/021d027))
* **sifrr-dom:** Add onProgress to loader ([4186e67](https://github.com/sifrr/sifrr/commit/4186e67))
* **sifrr-dom:** Add option to have element without any content ([f28fcea](https://github.com/sifrr/sifrr/commit/f28fcea))
* **sifrr-dom:** Add source url to executing scripts for error trace ([87b6277](https://github.com/sifrr/sifrr/commit/87b6277))
* **sifrr-dom:** bind event listener to element if this function ([692033b](https://github.com/sifrr/sifrr/commit/692033b))
* **sifrr-dom:** Improve binding execution ([0a7e182](https://github.com/sifrr/sifrr/commit/0a7e182))
* **sifrr-dom:** Make state binding separate ([#56](https://github.com/sifrr/sifrr/issues/56)) ([05a583e](https://github.com/sifrr/sifrr/commit/05a583e))
* **sifrr-dom:** Parse style separately than normal attributes ([#22](https://github.com/sifrr/sifrr/issues/22)) ([6e2d200](https://github.com/sifrr/sifrr/commit/6e2d200))
* **sifrr-dom:** Remove oldState tracking for simpleElement ([0a6712e](https://github.com/sifrr/sifrr/commit/0a6712e))
* **sifrr-dom:** Rename Sifrr.Dom.html to template ([fa7f736](https://github.com/sifrr/sifrr/commit/fa7f736))
* **sifrr-dom:** Save binding functions instead of text ([#43](https://github.com/sifrr/sifrr/issues/43)) ([e6e13e3](https://github.com/sifrr/sifrr/commit/e6e13e3))
* **sifrr-dom:** State should be immutable while cloning ([9864ea0](https://github.com/sifrr/sifrr/commit/9864ea0))
* **sifrr-dom:** Take template as data-html ([0bbebbf](https://github.com/sifrr/sifrr/commit/0bbebbf))
* **sifrr-dom:** Warn when element is not registered after executing scripts ([d6307ef](https://github.com/sifrr/sifrr/commit/d6307ef))
* **sifrr-fetch:** Add middleware to fetch ([4b7e572](https://github.com/sifrr/sifrr/commit/4b7e572))
* **sifrr-fetch:** Add progress option ([ce2bb64](https://github.com/sifrr/sifrr/commit/ce2bb64))
* **sifrr-route:** Add onactivation and ondeactivation callbacks ([9596993](https://github.com/sifrr/sifrr/commit/9596993))
* **sifrr-route:** Add support for regex groups ([19bbb85](https://github.com/sifrr/sifrr/commit/19bbb85))
* **sifrr-route:** change attribute from data-sifrr-path to plain path ([2d988dc](https://github.com/sifrr/sifrr/commit/2d988dc))
* **sifrr-route:** Don't refresh routes if link is same as before ([d9c3f81](https://github.com/sifrr/sifrr/commit/d9c3f81))
* **sifrr-route:** Support hash and query string ([8af76b6](https://github.com/sifrr/sifrr/commit/8af76b6))
* **sifrr-seo:** Add beforeRender/afterRender functions ([7697596](https://github.com/sifrr/sifrr/commit/7697596))
* **sifrr-seo:** Add better caching, and way to use other caches like memcache/redis/etc ([b50fa18](https://github.com/sifrr/sifrr/commit/b50fa18))
* **sifrr-seo:** Add capability to add puppeteer launch options ([dc56561](https://github.com/sifrr/sifrr/commit/dc56561))
* **sifrr-seo:** Add footer to ssr html ([33d8783](https://github.com/sifrr/sifrr/commit/33d8783))
* **sifrr-seo:** Add option to blacklist outgoing requests (closes [#38](https://github.com/sifrr/sifrr/issues/38)) ([cad17f3](https://github.com/sifrr/sifrr/commit/cad17f3))
* **sifrr-seo:** always get html fron localhost in puppeteer ([02fbe35](https://github.com/sifrr/sifrr/commit/02fbe35))
* **sifrr-seo:** Decouple render method from middleware ([cff93ac](https://github.com/sifrr/sifrr/commit/cff93ac))
* **sifrr-seo:** Don't load images and wait for xhr/fetch requests to complete ([f24172b](https://github.com/sifrr/sifrr/commit/f24172b))
* **sifrr-seo:** Save if should render, in previous requests ([81fe753](https://github.com/sifrr/sifrr/commit/81fe753))
* **sifrr-seo:** Take cache store as cache parameter ([4a4a2d7](https://github.com/sifrr/sifrr/commit/4a4a2d7))
* **sifrr-seo:** Take cacheKey as an option ([0455b2f](https://github.com/sifrr/sifrr/commit/0455b2f))
* **sifrr-seo:** Whitelist instead of blacklist ([4f03906](https://github.com/sifrr/sifrr/commit/4f03906))
* **sifrr-serviceworker:** Add cache_and_update policy ([3169670](https://github.com/sifrr/sifrr/commit/3169670))


### Performance Improvements

* **sifrr-dom:** Improve event performance ([fcbeedf](https://github.com/sifrr/sifrr/commit/fcbeedf))
* **sifrr-dom:** Improve simple element perf ([1064d2b](https://github.com/sifrr/sifrr/commit/1064d2b))
* **sifrr-dom:** Improve template calling performace in useShadowRoot ([2f53897](https://github.com/sifrr/sifrr/commit/2f53897))
* **sifrr-dom:** Improve update performance ([89a61ec](https://github.com/sifrr/sifrr/commit/89a61ec))
* **sifrr-dom:** Make makeequal work with nodes ([5d98d09](https://github.com/sifrr/sifrr/commit/5d98d09))
* **sifrr-seo:** Always keep browser open and cache rendered html ([be70607](https://github.com/sifrr/sifrr/commit/be70607))



## 0.0.1-alpha2 (2019-01-10 13:40:20 +0900)



