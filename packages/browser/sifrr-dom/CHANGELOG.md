## [0.0.5](https://github.com/sifrr/sifrr/compare/v0.0.4...v0.0.5) (2019-05-19)


### Features

* **sifrr-dom:** add js execution function ([0186437](https://github.com/sifrr/sifrr/commit/0186437))
* **sifrr-dom:** add Listener can take element as well ([e7662d4](https://github.com/sifrr/sifrr/commit/e7662d4))
* **sifrr-dom:** add root reference in repeated refs ([d5fbd62](https://github.com/sifrr/sifrr/commit/d5fbd62))
* **sifrr-dom:** add syncedAttrs ([d9dc170](https://github.com/sifrr/sifrr/commit/d9dc170))
* **sifrr-dom:** add two way binding between element states ([bd20eab](https://github.com/sifrr/sifrr/commit/bd20eab))
* **sifrr-dom:** don't give error if element has no state ([e99e5ea](https://github.com/sifrr/sifrr/commit/e99e5ea))
* **sifrr-dom:** make deep twoway binding work ([d9ba844](https://github.com/sifrr/sifrr/commit/d9ba844))
* **sifrr-dom:** set connected status for element ([014df65](https://github.com/sifrr/sifrr/commit/014df65))
* **sifrr-dom:** set global sifrr.dom on setup ([4335bbd](https://github.com/sifrr/sifrr/commit/4335bbd))
* **sifrr-dom:** strings also work as element template ([bf96a41](https://github.com/sifrr/sifrr/commit/bf96a41))
* **sifrr-dom:** warn if name already taken ([098d54e](https://github.com/sifrr/sifrr/commit/098d54e))


### Performance Improvements

* **sifrr-dom:** cache text node values ([45e6531](https://github.com/sifrr/sifrr/commit/45e6531))
* **sifrr-dom:** iterate backwards in arrays ([fe5efa5](https://github.com/sifrr/sifrr/commit/fe5efa5))
* **sifrr-dom:** trigger update only when there is listener ([6a736d9](https://github.com/sifrr/sifrr/commit/6a736d9))
* **sifrr-dom:** use array state maps for events and attributes ([cfdd514](https://github.com/sifrr/sifrr/commit/cfdd514))



## [0.0.4](https://github.com/sifrr/sifrr/compare/v0.0.3...v0.0.4) (2019-04-07)


### Bug Fixes

* **sifrr-dom:** Add listener on window instead of document ([bfda60b](https://github.com/sifrr/sifrr/commit/bfda60b))
* **sifrr-dom:** Don't add script to body except src ones ([638c53b](https://github.com/sifrr/sifrr/commit/638c53b))
* **sifrr-dom:** Don't make text content empty when disconnecting ([f1e3b1e](https://github.com/sifrr/sifrr/commit/f1e3b1e))
* **sifrr-dom:** Don't treat style attribute differently ([aacb43e](https://github.com/sifrr/sifrr/commit/aacb43e))
* **sifrr-dom:** fix clear perfornmace ([9a96838](https://github.com/sifrr/sifrr/commit/9a96838))
* **sifrr-dom:** fix event error message ([70c510f](https://github.com/sifrr/sifrr/commit/70c510f))
* **sifrr-dom:** fix keyed couldn't add elements in front ([efbced4](https://github.com/sifrr/sifrr/commit/efbced4))
* **sifrr-dom:** Fix repeat with sifrr element bug ([ea295b3](https://github.com/sifrr/sifrr/commit/ea295b3))
* **sifrr-dom:** Fix sifrr-element in simple-element bug ([7fb0c82](https://github.com/sifrr/sifrr/commit/7fb0c82))
* **sifrr-dom:** Fix target in event listener fxn execution ([bc899f6](https://github.com/sifrr/sifrr/commit/bc899f6))
* **sifrr-dom:** Fix Treewalker loop bug ([b88d792](https://github.com/sifrr/sifrr/commit/b88d792))
* **sifrr-dom:** Make TW filter fxn simpler ([711a24a](https://github.com/sifrr/sifrr/commit/711a24a))
* **sifrr-dom:** only bind event attribute if it has ${} ([2bc019e](https://github.com/sifrr/sifrr/commit/2bc019e))
* **sifrr-dom:** remove dependency on isHtml from nextNode ([2e116d7](https://github.com/sifrr/sifrr/commit/2e116d7))
* **sifrr-dom:** remove no content option, but make it work without any template ([27d0579](https://github.com/sifrr/sifrr/commit/27d0579))
* **sifrr-dom:** Remove redundant checking for attribute specified ([6c6ada9](https://github.com/sifrr/sifrr/commit/6c6ada9))
* **sifrr-dom:** Remove redundant checking for node exists ([c1a767f](https://github.com/sifrr/sifrr/commit/c1a767f))
* **sifrr-dom:** Remove relativeTo method ([75741ed](https://github.com/sifrr/sifrr/commit/75741ed))
* **sifrr-dom:** Removes attribute if value is falsy ([c268e3c](https://github.com/sifrr/sifrr/commit/c268e3c))
* **sifrr-dom:** Show element name whose js it is fetching ([efe96d2](https://github.com/sifrr/sifrr/commit/efe96d2))
* **sifrr-dom:** sifrr element not rendering in arrayToDom ([f9f1749](https://github.com/sifrr/sifrr/commit/f9f1749))
* **sifrr-dom:** Throw error if element already defined ([c15eed9](https://github.com/sifrr/sifrr/commit/c15eed9))
* **sifrr-dom:** treat repeating elements as html bindings ([96103d6](https://github.com/sifrr/sifrr/commit/96103d6))
* **sifrr-dom:** Try to get js file before html ([db49c8f](https://github.com/sifrr/sifrr/commit/db49c8f))
* **sifrr-dom:** use diff TW in different creators ([bc05b8f](https://github.com/sifrr/sifrr/commit/bc05b8f))
* Make babel.config.js work ([aedc697](https://github.com/sifrr/sifrr/commit/aedc697))
* **sifrr-dom:** Throw error on register element error ([bdfdac5](https://github.com/sifrr/sifrr/commit/bdfdac5))
* **sifrr-dom:** Use shadyCSS if available, and don't use use-shadow-root attribute ([4db2e10](https://github.com/sifrr/sifrr/commit/4db2e10))


### Features

* **sifrr-dom:** Add $ & $$ to all elements, fix make equal call ([b7c21b3](https://github.com/sifrr/sifrr/commit/b7c21b3))
* **sifrr-dom:** Add awesome event handling and use _ instead of $ in attribute name ([166f48c](https://github.com/sifrr/sifrr/commit/166f48c))
* **sifrr-dom:** add before update callback ([d136c8f](https://github.com/sifrr/sifrr/commit/d136c8f))
* **sifrr-dom:** Add dom argument to event listener ([c96a66b](https://github.com/sifrr/sifrr/commit/c96a66b))
* **sifrr-dom:** add error if event listener is not added ([6170c73](https://github.com/sifrr/sifrr/commit/6170c73))
* **sifrr-dom:** Add keyed implementation ([#48](https://github.com/sifrr/sifrr/issues/48)) ([e2155d4](https://github.com/sifrr/sifrr/commit/e2155d4))
* **sifrr-dom:** Add on update hook ([021d027](https://github.com/sifrr/sifrr/commit/021d027))
* **sifrr-dom:** Add onProgress to loader ([4186e67](https://github.com/sifrr/sifrr/commit/4186e67))
* **sifrr-dom:** Add option to have element without any content ([f28fcea](https://github.com/sifrr/sifrr/commit/f28fcea))
* **sifrr-dom:** Add source url to executing scripts for error trace ([87b6277](https://github.com/sifrr/sifrr/commit/87b6277))
* **sifrr-dom:** bind event listener to element if this function ([692033b](https://github.com/sifrr/sifrr/commit/692033b))
* **sifrr-dom:** don't clear if there are no childnodes ([dec0909](https://github.com/sifrr/sifrr/commit/dec0909))
* **sifrr-dom:** exec scripts in order ([59247f6](https://github.com/sifrr/sifrr/commit/59247f6))
* **sifrr-dom:** execute js in order ([f19879e](https://github.com/sifrr/sifrr/commit/f19879e))
* **sifrr-dom:** expose makeequal fxns ([026821d](https://github.com/sifrr/sifrr/commit/026821d))
* **sifrr-dom:** Improve binding execution ([0a7e182](https://github.com/sifrr/sifrr/commit/0a7e182))
* **sifrr-dom:** improve two-way binding and script loader ([8aa3a2d](https://github.com/sifrr/sifrr/commit/8aa3a2d))
* **sifrr-dom:** make function execution async ([2eee675](https://github.com/sifrr/sifrr/commit/2eee675))
* **sifrr-dom:** Make state binding separate ([#56](https://github.com/sifrr/sifrr/issues/56)) ([05a583e](https://github.com/sifrr/sifrr/commit/05a583e))
* **sifrr-dom:** Parse style separately than normal attributes ([#22](https://github.com/sifrr/sifrr/issues/22)) ([6e2d200](https://github.com/sifrr/sifrr/commit/6e2d200))
* **sifrr-dom:** remove dependency on sifrr-fetch, use fetch ([1c64ec0](https://github.com/sifrr/sifrr/commit/1c64ec0))
* **sifrr-dom:** Remove oldState tracking for simpleElement ([0a6712e](https://github.com/sifrr/sifrr/commit/0a6712e))
* **sifrr-dom:** Rename Sifrr.Dom.html to template ([fa7f736](https://github.com/sifrr/sifrr/commit/fa7f736))
* **sifrr-dom:** Save binding functions instead of text ([#43](https://github.com/sifrr/sifrr/issues/43)) ([e6e13e3](https://github.com/sifrr/sifrr/commit/e6e13e3))
* **sifrr-dom:** simplify sifrrClone and deep clone intelligently ([9819ab3](https://github.com/sifrr/sifrr/commit/9819ab3))
* **sifrr-dom:** State should be immutable while cloning ([9864ea0](https://github.com/sifrr/sifrr/commit/9864ea0))
* **sifrr-dom:** Take template as data-html ([0bbebbf](https://github.com/sifrr/sifrr/commit/0bbebbf))
* **sifrr-dom:** trigger update event on updated element ([ff64ae2](https://github.com/sifrr/sifrr/commit/ff64ae2))
* **sifrr-dom:** Warn when element is not registered after executing scripts ([d6307ef](https://github.com/sifrr/sifrr/commit/d6307ef))


### Performance Improvements

* **sifrr-dom:** directly access _state to avoid function call ([9ba19d2](https://github.com/sifrr/sifrr/commit/9ba19d2))
* **sifrr-dom:** improve event listeners ([8381454](https://github.com/sifrr/sifrr/commit/8381454))
* **sifrr-dom:** Improve event performance ([fcbeedf](https://github.com/sifrr/sifrr/commit/fcbeedf))
* **sifrr-dom:** Improve simple element perf ([1064d2b](https://github.com/sifrr/sifrr/commit/1064d2b))
* **sifrr-dom:** Improve template calling performace in useShadowRoot ([2f53897](https://github.com/sifrr/sifrr/commit/2f53897))
* **sifrr-dom:** Improve update performance ([89a61ec](https://github.com/sifrr/sifrr/commit/89a61ec))
* **sifrr-dom:** Make makeequal work with nodes ([5d98d09](https://github.com/sifrr/sifrr/commit/5d98d09))
* **sifrr-dom:** update property for class,id,value attribute ([215fd7a](https://github.com/sifrr/sifrr/commit/215fd7a))



## 0.0.1-alpha2 (2019-01-10)



