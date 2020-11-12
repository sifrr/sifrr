## [0.0.8](https://github.com/sifrr/sifrr/compare/v0.0.7...v0.0.8) (2020-11-12)



## [0.0.7](https://github.com/sifrr/sifrr/compare/v0.0.6...v0.0.7) (2020-11-10)


### Bug Fixes

* **sifrr-dom:** `register` always returns a promise ([93c3165](https://github.com/sifrr/sifrr/commit/93c31650fb2ea8fde2c6b1ac122eaa9e45bd4cd9))
* **sifrr-dom:** bubble only bubblable events ([8fdf844](https://github.com/sifrr/sifrr/commit/8fdf844084a2a282865a9ac80080d68b5db918fc))
* **sifrr-dom:** call event listener only on target ([a91784f](https://github.com/sifrr/sifrr/commit/a91784f492c32791d06f03707459f64a1cf1aa62))
* **sifrr-dom:** don't set global.Sifrr.Dom on setup ([cce028c](https://github.com/sifrr/sifrr/commit/cce028c2026d2c82ec574d0b8e7254a0c3a00bf4))
* **sifrr-dom:** remove synced attrs when you already have props ([3436508](https://github.com/sifrr/sifrr/commit/343650838a41504f028e23c5de0abcd50b04536f))
* **sifrr-dom:** state prop change doesn't trigger update bug ([9123a1c](https://github.com/sifrr/sifrr/commit/9123a1c1d8fa607425a70b65972654bfc94d8796))
* **sifrr-fetch:** set content-type json if body is an array ([3115905](https://github.com/sifrr/sifrr/commit/31159058a505525f7c0e6e4af1ccc60f635d6f56))
* **sifrr-fetch:** stringify body even if content type manually set ([5f6fd63](https://github.com/sifrr/sifrr/commit/5f6fd63647a98494b4831dee62314216f2ab168b))
* graphql npe fix ([d0e0244](https://github.com/sifrr/sifrr/commit/d0e0244edf73c13ce1aa5cd46c20d413665151c1))
* **sifrr-server:** only need graphql if it is used ([5b53b9f](https://github.com/sifrr/sifrr/commit/5b53b9f9df245d373beee84657f8023356fae331))
* **sifrr-server:** remove prohibited headers ([849986f](https://github.com/sifrr/sifrr/commit/849986f08933fbf097ea92144218541329a7dc00))
* **sifrr-tempalte:** small bug fixes ([3ce4879](https://github.com/sifrr/sifrr/commit/3ce4879d2cd8ed27d46c5b0137d1ea48768f137b))
* **sifrr-template:** call onPropChange on direct prop also ([46363ed](https://github.com/sifrr/sifrr/commit/46363ed93464acb903d6adf575073d6aa2bbaaf9))
* **sifrr-template:** fix style reset bug, and fragment bug ([ff06855](https://github.com/sifrr/sifrr/commit/ff068552d4cbec659e90dd001421d36289569ce4))


### Features

* **sifrr-api:** add graphql subscription support ([9594629](https://github.com/sifrr/sifrr/commit/9594629d9ea8c978ebdc9f90009e893b8e093dc5))
* **sifrr-api:** convert graphql to independent reusable implementation ([#240](https://github.com/sifrr/sifrr/issues/240)) ([f1436fb](https://github.com/sifrr/sifrr/commit/f1436fb2ae55015a1f546d6f75351f1914a6bb04))
* **sifrr-api:** convert to work with @sifrr/server ([addc846](https://github.com/sifrr/sifrr/commit/addc8467907a453e7470a1c7d131b24de578e3df))
* **sifrr-api:** deprecate graphql models and schema builder ([7a19944](https://github.com/sifrr/sifrr/commit/7a19944b5eab3be45425cbe8e35a9066c19bc391))
* **sifrr-api:** save versioned schema files ([96bae6f](https://github.com/sifrr/sifrr/commit/96bae6f7d3f03107313e02c67ae5f1258c9450c3))
* **sifrr-cli:** migrate to ts ([#320](https://github.com/sifrr/sifrr/issues/320)) ([a8a4673](https://github.com/sifrr/sifrr/commit/a8a4673b995311dc5f60a79a99c089d95701c09a))
* **sifrr-dom:** :sifrr-bind can take function too ([830c413](https://github.com/sifrr/sifrr/commit/830c413e4f27be5d0c81f71c537fa3727e0c99d7))
* **sifrr-dom:** [BREAKING] convert sifrr attributes to props ([940c707](https://github.com/sifrr/sifrr/commit/940c7072b69dea003227022dc76c6ed9f75f051e))
* **sifrr-dom:** add bindStoresToElement function ([e2169c9](https://github.com/sifrr/sifrr/commit/e2169c9992690538ed6d7eb45eabf6c349815e38))
* **sifrr-dom:** add on update to store ([03d96b3](https://github.com/sifrr/sifrr/commit/03d96b3ac4fd92a753a37dbb0dc8f3325a5b9a3f))
* **sifrr-dom:** add onPropsChange function ([48f729e](https://github.com/sifrr/sifrr/commit/48f729e577cee1e3e4feaa51b0a1e1b1ba3e684c))
* **sifrr-dom:** add update in store ([e659cc9](https://github.com/sifrr/sifrr/commit/e659cc9ee93f1ade214825fbcb87f9ef57610836))
* **sifrr-dom:** all sifrr props are prefixed with `sifrr` (`sifrrKey`, `sifrrDefaultState`) ([9efa5cd](https://github.com/sifrr/sifrr/commit/9efa5cdf57d27a094f9fc46240a470f431dcd233))
* **sifrr-dom:** change data-sifrr-key to :key ([3ed1fdf](https://github.com/sifrr/sifrr/commit/3ed1fdfc8e7e3d1bf3281b090e00cc3b394c6455))
* **sifrr-dom:** config can have url function that returns element url ([88b4e4c](https://github.com/sifrr/sifrr/commit/88b4e4c226d37b39ff9fbfaf47db19a6b978d8fc))
* **sifrr-dom:** convert to es6 module syntax ([58454fa](https://github.com/sifrr/sifrr/commit/58454fa4ef198e4aa9f1a047473cdb7abdc20c84))
* **sifrr-dom:** data-sifrr-repeat is now `:sifrr-repeat` prop ([57bedf6](https://github.com/sifrr/sifrr/commit/57bedf623ac06bd8fec3f92f5b4cadf099569115))
* **sifrr-dom:** fix: style prop works now ([c337ec4](https://github.com/sifrr/sifrr/commit/c337ec4ba5c16d1993f23f578a362726816d69ce))
* **sifrr-dom:** migrate to typescript ([#266](https://github.com/sifrr/sifrr/issues/266)) ([25793d8](https://github.com/sifrr/sifrr/commit/25793d809d9dfcedd50acf420454d8bcad4db28f))
* **sifrr-dom:** props with `:` prefixes ([0c30b87](https://github.com/sifrr/sifrr/commit/0c30b87bad40fe0c995a3269bb43d0d638f53304))
* **sifrr-dom:** props work with normal string values without bindings ([6da9dd4](https://github.com/sifrr/sifrr/commit/6da9dd4b5c711d9d53611a93d2592563a64015b0))
* **sifrr-dom:** render-if prop, that stops element from render/showing ([eaa5afa](https://github.com/sifrr/sifrr/commit/eaa5afadbb3108e2c463ee5ae9b038f5ef97a2fb))
* **sifrr-dom:** replace templating engine with @sifrr/template ([#300](https://github.com/sifrr/sifrr/issues/300)) ([8dafe10](https://github.com/sifrr/sifrr/commit/8dafe1089ddd882b58c11479913cfa2250b59d49))
* **sifrr-dom:** setState, getState instead of getter/setter ([2db75b4](https://github.com/sifrr/sifrr/commit/2db75b4ad39d2c0f9368ea185c497cd2283b30f4))
* **sifrr-fetch:** add graphql subscription support to WebSocket ([eacdb0f](https://github.com/sifrr/sifrr/commit/eacdb0f0d5171d89f4a5e5860dc2ef30a2d35346))
* **sifrr-fetch:** define default graphql path ([f1fa65d](https://github.com/sifrr/sifrr/commit/f1fa65d24f2245e34c05a486d1b44be440db14d5))
* **sifrr-fetch:** migrate to typescript ([cacf018](https://github.com/sifrr/sifrr/commit/cacf018606cea0da5afd1996145db3de19bc9ab8))
* **sifrr-fetch:** websocket works in node ([5dcb710](https://github.com/sifrr/sifrr/commit/5dcb710bbfe3a0d2f7ac3a2b8f94775094c178d2))
* **sifrr-route:** migrate to typescript ([7a6911e](https://github.com/sifrr/sifrr/commit/7a6911e24dbc1bcbcd6f2d4f691a247106b2ad1f))
* **sifrr-route:** use :path prop for setting paths ([ca07421](https://github.com/sifrr/sifrr/commit/ca0742161dd6c9d5b74dd96e099f27beb6b96e60))
* **sifrr-route:** use renderIf to show/hide routes ([8df443f](https://github.com/sifrr/sifrr/commit/8df443f44ede022ed2e4d27f0523822d247e252c))
* **sifrr-server:** add body helpers in put, patch requests ([7cb2861](https://github.com/sifrr/sifrr/commit/7cb286150f9c72ab59e4c9558372f58743ba4575))
* **sifrr-server:** add getQuery function ([bc5845a](https://github.com/sifrr/sifrr/commit/bc5845a4266aaedfe9241c13e350a8d4a540bf8c))
* **sifrr-server:** add graphql subscription support ([f9b0803](https://github.com/sifrr/sifrr/commit/f9b0803557d73eef4ba5faf10264eeb0f26e9cfe))
* **sifrr-server:** auto live reload without any setup ([055cfa4](https://github.com/sifrr/sifrr/commit/055cfa4f10972db3d6fa5e709c1c8c3cd071cf4f))
* **sifrr-server:** convert createCluster to cluster class ([#236](https://github.com/sifrr/sifrr/issues/236)) ([f75daa5](https://github.com/sifrr/sifrr/commit/f75daa5f144882e77de56403c7de2880a512b519))
* **sifrr-server:** migrate to ts ([#319](https://github.com/sifrr/sifrr/issues/319)) ([206b8f1](https://github.com/sifrr/sifrr/commit/206b8f1c2d8756b85fa8030ea57f5008ee6262c6))
* **sifrr-serviceworker:** convert to es6 module syntax ([20724af](https://github.com/sifrr/sifrr/commit/20724af88051df23b11f754d301cc6d804401b87))
* **sifrr-serviceworker:** migrate to typescript ([2904591](https://github.com/sifrr/sifrr/commit/2904591ac619a3679726fd6a18eb222239da07fe))
* **sifrr-storage:** add memoize function ([f10e638](https://github.com/sifrr/sifrr/commit/f10e638fbb3ff24f8160ceb0456e2f2ac742f75e))
* **sifrr-storage:** add ttl support ([4a307c6](https://github.com/sifrr/sifrr/commit/4a307c625a68665e1cc86084633785490b0f45f7))
* **sifrr-storage:** migrate to es6 ([e86cf65](https://github.com/sifrr/sifrr/commit/e86cf65d750df050e5a3478aa766968801c1f13b))
* **sifrr-storage:** migrate to typescript ([#261](https://github.com/sifrr/sifrr/issues/261)) ([01d6f6c](https://github.com/sifrr/sifrr/commit/01d6f6c28f43c00e73d620db0dc5a6e2808af384))
* **sifrr-template:** add async/promise support in binding funct… ([#298](https://github.com/sifrr/sifrr/issues/298)) ([28c9be2](https://github.com/sifrr/sifrr/commit/28c9be2612fc26c864902e9a71227c06e096a504))
* **sifrr-template:** add store ([48cc02c](https://github.com/sifrr/sifrr/commit/48cc02ca0e651023612136dc285ef7bad8955588))
* **sifrr-template:** add styled function ([80da761](https://github.com/sifrr/sifrr/commit/80da761df7fc91d98488d3f4f9035554ad48cad8))
* **sifrr-template:** call onPropChange on node if exists ([ae0f9ef](https://github.com/sifrr/sifrr/commit/ae0f9ef702370dd37f5d2dcec3adc1199eb6382a))
* **sifrr-template:** direct prop bindings work with object/symbol ([4862c9d](https://github.com/sifrr/sifrr/commit/4862c9d0165cb8a6a41254d5e6eec29b6ccca59a))
* **sifrr-template:** extract template to its own package ([#281](https://github.com/sifrr/sifrr/issues/281)) ([a8e59a6](https://github.com/sifrr/sifrr/commit/a8e59a67b58a61d314e3fc93f618083cdf0863a8))



## [0.0.6](https://github.com/sifrr/sifrr/compare/v0.0.5...v0.0.6) (2019-07-27)


### Bug Fixes

* **sifrr-dom:** update value of inputs only if changed ([d02360e](https://github.com/sifrr/sifrr/commit/d02360e02252eaa0519c2dcea4312cd54b790c88))
* **sifrr-fetch:** don't set content type if body is not json object ([695b588](https://github.com/sifrr/sifrr/commit/695b588e8fe9a47f6c066abe5ea12ddf5f67da74))
* **sifrr-storage:** fix typed array and blob support ([357ee65](https://github.com/sifrr/sifrr/commit/357ee65def58540dc9b6ccd27201271e7113e34d))
* **sifrr-storage:** store = correctly in cookies ([06544a8](https://github.com/sifrr/sifrr/commit/06544a8eb433ef48f88c65c7f14ae704bc551ea8))


### Features

* **sifrr-api:** add queries,mutations,attrs easily using getters ([9d15a66](https://github.com/sifrr/sifrr/commit/9d15a66d14b81e55271dfaf639ed105c2cb6e652))
* **sifrr-dom:** add `root` property which gives parent sifrr element ([f5c5c9d](https://github.com/sifrr/sifrr/commit/f5c5c9d499b881998f892c6496ba8a4ebb5f2da8))
* **sifrr-dom:** add basic hooks ([f5208e1](https://github.com/sifrr/sifrr/commit/f5208e111cc2fc4d76839146ed10e4688d0e6320))
* **sifrr-dom:** make hooks work with other types, array too ([c068fb3](https://github.com/sifrr/sifrr/commit/c068fb35d324d6794a62c0bf52d36e06cd7b6b4a))
* **sifrr-dom:** rename hook to store ([4981b71](https://github.com/sifrr/sifrr/commit/4981b71512b439621e9f562800beb519de619527))
* **sifrr-dom:** set custom name for element on register ([1e5435b](https://github.com/sifrr/sifrr/commit/1e5435bb85eb9b4bedf918a024ad088ec5512796))
* **sifrr-dom:** template can take (html, style) as argument ([2a17d08](https://github.com/sifrr/sifrr/commit/2a17d08e1d7efee67a20106001404586af1a3d55))
* **sifrr-fetch:** add before and after hooks ([9619e41](https://github.com/sifrr/sifrr/commit/9619e4181c4b5c778d21356b2ccd9af69dbacd16))
* **sifrr-fetch:** add more progress options ([d674726](https://github.com/sifrr/sifrr/commit/d674726176251118a992c7d0b33af9d5a27f3a47))
* **sifrr-fetch:** add use hook ([7f3e6b8](https://github.com/sifrr/sifrr/commit/7f3e6b8c60a633bd2c71d089caff55e4ca07652e))
* **sifrr-fetch:** take fallback function as parameter in wsfetch ([52743b3](https://github.com/sifrr/sifrr/commit/52743b348c8a810699146561a460bd31f022f275))
* **sifrr-fetch:** works with node also ([71e4337](https://github.com/sifrr/sifrr/commit/71e4337b231000b4d6dc54e64fac814bbbd8ffcc))
* **sifrr-route:** add json support in data-sifrr-elements ([fc48a62](https://github.com/sifrr/sifrr/commit/fc48a627477f538de36304e32b374b8a77573b17))
* **sifrr-seo:** make seo independent of overall design ([3fc918a](https://github.com/sifrr/sifrr/commit/3fc918ae9dd2eff6d08e2b00c46dbeb51a190b91))
* **sifrr-seo:** rename middleware to more specific express middleware ([528890a](https://github.com/sifrr/sifrr/commit/528890ad1c2b9f2be87d8b62bad4dd889d534783))
* **sifrr-server:** add createCluster function ([98bca3a](https://github.com/sifrr/sifrr/commit/98bca3a4a3933389fb6ecdb420e30c3d92a53584))
* **sifrr-server:** add graphql server to sifrr-server ([d5efcc2](https://github.com/sifrr/sifrr/commit/d5efcc23c4b75d0984c06fe2b3ab67adef2c5553))
* add timeout and instance with default options ([05476c7](https://github.com/sifrr/sifrr/commit/05476c799b9e6e753e2cbab19913ccb2f706e5b8))
* **sifrr-server:** add livereload feature (experimental) ([fb1005b](https://github.com/sifrr/sifrr/commit/fb1005bec8f96277acf71c1ed06c6968ac8f8acc))
* **sifrr-server:** add options to overwrite/fail on dup static route ([c515745](https://github.com/sifrr/sifrr/commit/c5157451e76e1c221fd019193371550e7950f134))
* **sifrr-server:** cache works for compressed file as well ([c0821e0](https://github.com/sifrr/sifrr/commit/c0821e013838658a33c05e706d19498a54cf038d))
* **sifrr-server:** close watchers on server close ([0cca0a1](https://github.com/sifrr/sifrr/commit/0cca0a125241f35326082d9b864e460216dcbe3d))
* **sifrr-server:** make live reload js importable ([9c29147](https://github.com/sifrr/sifrr/commit/9c29147ccdfed5173a73420359e8d4c24b17a634))
* **sifrr-server:** update uWS.js to 15.11.0 ([dc81e97](https://github.com/sifrr/sifrr/commit/dc81e97f35faaab566329d214f92774b33425039))
* **sifrr-storage:** refactor cookies to support larger data ([00ae6c8](https://github.com/sifrr/sifrr/commit/00ae6c84a41bc7b39d049a9567be8fdd9866893b))


### Reverts

* remove why is node running ([0e295c4](https://github.com/sifrr/sifrr/commit/0e295c4ebd2172098f9f31fffe535a72a136e888))



## [0.0.5](https://github.com/sifrr/sifrr/compare/v0.0.4...v0.0.5) (2019-05-20)


### Bug Fixes

* **sifrr-server:** abort passing stream when compressed ([7462264](https://github.com/sifrr/sifrr/commit/7462264473321dee90cc20d43a4fa70b51a7dca5))
* **sifrr-server:** fix mutable headers issue ([026c675](https://github.com/sifrr/sifrr/commit/026c675d19edc0e357c76d7e76c81d5ef0761677))
* **sifrr-server:** return this after close ([e992c38](https://github.com/sifrr/sifrr/commit/e992c383d09b37424b0ed9206b09a3575a8de05b))
* **sifrr-storage:** fix bug of not returning falsy values in indexeddb ([5dd8521](https://github.com/sifrr/sifrr/commit/5dd8521fec920f9a72e7ace08bdf1c7df2114a4f))


### Features

* **sifrr-api:** association works in sequelize create resolver ([b1e354e](https://github.com/sifrr/sifrr/commit/b1e354e71199f7430f147706791457e050f3bb72))
* **sifrr-api:** make connection query work ([4f753c0](https://github.com/sifrr/sifrr/commit/4f753c0227c5724c92c2a0a2017d2089ab48ba4b))
* **sifrr-cli:** update to use import syntax ([81e0f34](https://github.com/sifrr/sifrr/commit/81e0f342d808df418791998d9f617d523d4e2191))
* **sifrr-dom:** add js execution function ([0186437](https://github.com/sifrr/sifrr/commit/018643754ad70ede8b56cf77552987811b8a03c0))
* **sifrr-dom:** add Listener can take element as well ([e7662d4](https://github.com/sifrr/sifrr/commit/e7662d43a3b650f54ddb128e150fbaa2fa3aec5f))
* **sifrr-dom:** add root reference in repeated refs ([d5fbd62](https://github.com/sifrr/sifrr/commit/d5fbd6276714ae07a9ef833354eb4a0b6467d21f))
* **sifrr-dom:** add syncedAttrs ([d9dc170](https://github.com/sifrr/sifrr/commit/d9dc170b2f22f1b52e36f42fa0c1f8abbd31bdce))
* **sifrr-dom:** add two way binding between element states ([bd20eab](https://github.com/sifrr/sifrr/commit/bd20eab795de37c115144f05a6ea84fd7e5860a2))
* **sifrr-dom:** don't give error if element has no state ([e99e5ea](https://github.com/sifrr/sifrr/commit/e99e5eaf1153fccdcbccbbee8132c0e5f7ec95a8))
* **sifrr-dom:** set connected status for element ([014df65](https://github.com/sifrr/sifrr/commit/014df653d33cb31af0d3a9e1e8d41b36231c2434))
* **sifrr-dom:** set global sifrr.dom on setup ([4335bbd](https://github.com/sifrr/sifrr/commit/4335bbd91d5f2abab2850b845bf88799c0200fb6))
* **sifrr-dom:** strings also work as element template ([bf96a41](https://github.com/sifrr/sifrr/commit/bf96a41a8e16036e9148b91d6bfdca2f6263b05b))
* **sifrr-dom:** warn if name already taken ([098d54e](https://github.com/sifrr/sifrr/commit/098d54e81d1307c3c0e9ba47a10f03bd6399795c))
* **sifrr-fetch:** add speed as second parameter in onProgress fxn ([10d0419](https://github.com/sifrr/sifrr/commit/10d0419ee2c62d2f17e18bb719822285a051a43c))
* **sifrr-fetch:** take options in fallback paramete in ws ([b0d76e2](https://github.com/sifrr/sifrr/commit/b0d76e203161e3b8b58921191f53068403d03f69))
* **sifrr-route:** add events on activation and deactivation ([16a8911](https://github.com/sifrr/sifrr/commit/16a8911fb6bad93264e743d9397036e401c036a3))
* **sifrr-route:** don't add Route to Dom, add to Sifrr.Route ([8bde333](https://github.com/sifrr/sifrr/commit/8bde3336df2dfe59e733604b91610412d21732af))
* **sifrr-server:** add option to change filename for tmpdir ([c2a9330](https://github.com/sifrr/sifrr/commit/c2a93307cde3354fba91f4fe5537337d41686f98))
* **sifrr-server:** add optional caching  ([#106](https://github.com/sifrr/sifrr/issues/106)) ([cf74306](https://github.com/sifrr/sifrr/commit/cf743062b42b8ecdbe37f161f0dc3af8db72fe7e))
* **sifrr-server:** change ext methods to mimes/getMime ([724ecb5](https://github.com/sifrr/sifrr/commit/724ecb504814ef5abaa873d12c2ed2aded0808f8))
* **sifrr-server:** clone connection with same resolver if none given ([a3ef846](https://github.com/sifrr/sifrr/commit/a3ef8462bcd787d4a1061ea8edeeadbf2e576211))
* **sifrr-server:** make compress: false as default ([af95e82](https://github.com/sifrr/sifrr/commit/af95e82ca48a239d77d69cb5f844c937ea5ed424))
* **sifrr-storage:** add keys() method ([d23ea59](https://github.com/sifrr/sifrr/commit/d23ea5994acd4e6689f9458ecf553e05830353a4))
* **sifrr-storage:** add support for ArrayBuffer, TypedArray data types ([40b62e9](https://github.com/sifrr/sifrr/commit/40b62e977557822a35bed5c0b29f497ea5c5b5cd))


### Performance Improvements

* **sifrr-dom:** cache text node values ([45e6531](https://github.com/sifrr/sifrr/commit/45e6531e177c1c29ab76ac3e86cf48e9c5f9dcf4))
* **sifrr-dom:** iterate backwards in arrays ([fe5efa5](https://github.com/sifrr/sifrr/commit/fe5efa51bc57dfeb0d801f110ecec1f5a5013fd2))
* **sifrr-dom:** trigger update only when there is listener ([6a736d9](https://github.com/sifrr/sifrr/commit/6a736d909656c1498f57bc9b1bff2d287ea8fe2d))
* **sifrr-dom:** use array state maps for events and attributes ([cfdd514](https://github.com/sifrr/sifrr/commit/cfdd51410222c04b8aa02cdee4b34cec198edb0b))
* **sifrr-storage:** add speed tests ([323dbdf](https://github.com/sifrr/sifrr/commit/323dbdfe141cba0f534da8d59496fa89fce080ce))
* **sifrr-storage:** improve performance of localstorage ([8254ca1](https://github.com/sifrr/sifrr/commit/8254ca19dd863a6b4b99777fac741d239794f3a6))
* **sifrr-storage:** use outer keys instead of inline keys ([04291c3](https://github.com/sifrr/sifrr/commit/04291c36b3d2a44a6548189d83fb69039dd62e2e))



## [0.0.4](https://github.com/sifrr/sifrr/compare/v0.0.3...v0.0.4) (2019-04-07)


### Bug Fixes

* **sifrr-dom:** fix event error message ([70c510f](https://github.com/sifrr/sifrr/commit/70c510f44ea97ddb08bf55dbc7b14053104d75b3))
* **sifrr-dom:** fix keyed couldn't add elements in front ([efbced4](https://github.com/sifrr/sifrr/commit/efbced403ca7e7d8bdb9bf453f5de30510eac21b))
* **sifrr-dom:** only bind event attribute if it has ${} ([2bc019e](https://github.com/sifrr/sifrr/commit/2bc019e5a40b5efc0f49c589dbec828b330e5c53))
* **sifrr-dom:** remove dependency on isHtml from nextNode ([2e116d7](https://github.com/sifrr/sifrr/commit/2e116d73cdd07051acbf2685c29abc833ba822e7))
* **sifrr-dom:** treat repeating elements as html bindings ([96103d6](https://github.com/sifrr/sifrr/commit/96103d6f5802bd0fcaccf0b4374f6aa37eedc3eb))
* **sifrr-dom:** use diff TW in different creators ([bc05b8f](https://github.com/sifrr/sifrr/commit/bc05b8f750a6bcc3710a1c7822a84bec906b5a0a))
* **sifrr-fetch:** don't set content-type if already set ([e9509c8](https://github.com/sifrr/sifrr/commit/e9509c883214098bcd7f6f60a68c87dc4bb6b6f7))
* tests ([afabbe9](https://github.com/sifrr/sifrr/commit/afabbe96656230dc0b016bd60f619120c5cf93ed))
* **sifrr-server:** content-length for ranged responses ([6612526](https://github.com/sifrr/sifrr/commit/6612526237b85cc5ce3da4c93531263ad8fa06c3))
* **sifrr-server:** don't extend constructor ([9038a1e](https://github.com/sifrr/sifrr/commit/9038a1e779fad3d526bab80e3459ad386cda9096))
* **sifrr-server:** fix serving from basePath ([4d04976](https://github.com/sifrr/sifrr/commit/4d04976238ca302cf215dc825dda07d8f1590d86))
* **sifrr-server:** write headers after compression ([fdd4958](https://github.com/sifrr/sifrr/commit/fdd49581f6fb36d8888f1d9a47e83a8ca3d7969f))


### Features

* **sifrr-cli:** remove db:reset setup tasks ([9bbd829](https://github.com/sifrr/sifrr/commit/9bbd829e475f29cdd4154f2a53af64bf0867c4c8))
* **sifrr-dom:** add before update callback ([d136c8f](https://github.com/sifrr/sifrr/commit/d136c8f3dc8925e0c8f524dad3c5ae013186215f))
* **sifrr-dom:** add error if event listener is not added ([6170c73](https://github.com/sifrr/sifrr/commit/6170c7342f45fdd7bab7cf039af842ead975bf07))
* **sifrr-dom:** don't clear if there are no childnodes ([dec0909](https://github.com/sifrr/sifrr/commit/dec090903e29d49d90a95f3995b3bf7f7db2d466))
* **sifrr-dom:** exec scripts in order ([59247f6](https://github.com/sifrr/sifrr/commit/59247f60b7419888db5d8409e16f475a62f924f2))
* **sifrr-dom:** execute js in order ([f19879e](https://github.com/sifrr/sifrr/commit/f19879e2c410b53219e06fd3e88fd1c92d838c5b))
* **sifrr-dom:** expose makeequal fxns ([026821d](https://github.com/sifrr/sifrr/commit/026821d796e23e0450fa22f81380a2c66850dcef))
* **sifrr-dom:** improve two-way binding and script loader ([8aa3a2d](https://github.com/sifrr/sifrr/commit/8aa3a2dea515c54add45d0bf0ec4f4c8c1198e97))
* **sifrr-dom:** make function execution async ([2eee675](https://github.com/sifrr/sifrr/commit/2eee6755c053ed18970a39d72674429489dbc47c))
* **sifrr-dom:** remove dependency on sifrr-fetch, use fetch ([1c64ec0](https://github.com/sifrr/sifrr/commit/1c64ec06d6831d351a8a94739dd0ddb3b54e4f2e))
* **sifrr-dom:** simplify sifrrClone and deep clone intelligently ([9819ab3](https://github.com/sifrr/sifrr/commit/9819ab31a21b7731edeb861d64861825a18fa67c))
* **sifrr-dom:** trigger update event on updated element ([ff64ae2](https://github.com/sifrr/sifrr/commit/ff64ae2914a0155c87f085630723d73feaf7a602))
* **sifrr-fetch:** add close method ([db5578c](https://github.com/sifrr/sifrr/commit/db5578c499dff2f55a8f3fe395bbd2da986fcd5e))
* **sifrr-fetch:** add fallback for graphql websockets ([ebb9f31](https://github.com/sifrr/sifrr/commit/ebb9f31b49b0794070c857ebc6f1469d5c4889db))
* **sifrr-fetch:** add graphql websockets ([b68c5a8](https://github.com/sifrr/sifrr/commit/b68c5a8934802bcaa030be0f2146499db4955920))
* **sifrr-fetch:** don't set options except redirect ([7bb0c7c](https://github.com/sifrr/sifrr/commit/7bb0c7c06405e04d0ae0e545dacff4c3d35211a8))
* **sifrr-fetch:** only stringify if body is js object ([cdd858b](https://github.com/sifrr/sifrr/commit/cdd858bd36f2ff42aadb5dd396912565c6e57764))
* **sifrr-seo:** limit browsers to 1 ([29941a1](https://github.com/sifrr/sifrr/commit/29941a196be2e7419669610ab2e8fa488eff9734))
* **sifrr-server:** add capability to serve single file ([6852531](https://github.com/sifrr/sifrr/commit/6852531447d84439a18febd652ec5d41b012941d))
* **sifrr-server:** add close method ([ea85bfd](https://github.com/sifrr/sifrr/commit/ea85bfdacfa9f33b72a6ebd35db2aa31c3af609c))
* **sifrr-server:** add compression ([509e1dd](https://github.com/sifrr/sifrr/commit/509e1ddf17c2961a9d6613e03d78e9b4094a52d7))
* **sifrr-server:** add load routes function ([7618070](https://github.com/sifrr/sifrr/commit/76180701ca44a80ec5cd0d6a384da1f7e90b4cb8))
* **sifrr-server:** add post body parsing (json, form data) ([560244f](https://github.com/sifrr/sifrr/commit/560244fc3610a7fd509cdde9f69ac4303da850f0))
* **sifrr-server:** add static server with last-modified based 304 ([4540e93](https://github.com/sifrr/sifrr/commit/4540e93d5a86626f2b6f42bec2f1c941664253a1))
* **sifrr-server:** delegate to uws app, add static serving method ([8bc9fa6](https://github.com/sifrr/sifrr/commit/8bc9fa6d22f225abf6d48b1ca408b788497b1c31))
* **sifrr-server:** don't send headers on 304 ([1702009](https://github.com/sifrr/sifrr/commit/1702009e7cd283a4dae3c43d8b198fed2c6bb312))
* **sifrr-server:** handle connection closing, streaming ([0762cb7](https://github.com/sifrr/sifrr/commit/0762cb7e9c937991da36c59166c56ffc4e981359))
* **sifrr-server:** inherit from uws Apps ([330d85a](https://github.com/sifrr/sifrr/commit/330d85a7bcc01990c4873bad586283d508cf56df))
* **sifrr-server:** make sendFile async ([f26cc9d](https://github.com/sifrr/sifrr/commit/f26cc9d4306e2a0955bbfdc93758df560a8f7553))
* **sifrr-server:** only use last modified if set to true ([ed39a1a](https://github.com/sifrr/sifrr/commit/ed39a1aa67d5d277b1adcf9977c1758e6dbd579b))
* **sifrr-server:** serve in ranges of ranges header present ([3658eab](https://github.com/sifrr/sifrr/commit/3658eab219f16753d118725960ba5b7133ff5626))
* **sifrr-server:** watch for new files and deleted files ([2752d48](https://github.com/sifrr/sifrr/commit/2752d48947e1246a609fdc8c4dd6fe57ad3bc1c1))
* **sifrr-server:** watch only when option given ([5ef7703](https://github.com/sifrr/sifrr/commit/5ef77030446caf6d1373ccee3d162df1f329a207))


### Performance Improvements

* **sifrr-dom:** directly access _state to avoid function call ([9ba19d2](https://github.com/sifrr/sifrr/commit/9ba19d20443021390883adbca028fbf132e04f2e))
* **sifrr-dom:** improve event listeners ([8381454](https://github.com/sifrr/sifrr/commit/8381454b590bd45495116104c1a06c3ea3caf6b6))
* **sifrr-dom:** update property for class,id,value attribute ([215fd7a](https://github.com/sifrr/sifrr/commit/215fd7adee8fd7674dfa3d45317ab46816810f78))
* **sifrr-server:** clone from typedarray ([abea750](https://github.com/sifrr/sifrr/commit/abea750b02d4677720582f4b85181c66695794cc))
* **sifrr-server:** directly use stream in form data and body ([0af7fb9](https://github.com/sifrr/sifrr/commit/0af7fb9c11709adca47bd1b4b3732e3fd90e5fb4))
* **sifrr-server:** make stream to buffer more efficient ([1d16c9d](https://github.com/sifrr/sifrr/commit/1d16c9d4216b814990684268d47b0d2f71a9d519))



## [0.0.3](https://github.com/sifrr/sifrr/compare/v0.0.1-alpha2...v0.0.3) (2019-03-05)


### Bug Fixes

* **package:** update yargs to version 13.1.0 ([#39](https://github.com/sifrr/sifrr/issues/39)) ([7789b21](https://github.com/sifrr/sifrr/commit/7789b2199af3b4c2c06464852c2385f3dcfa93ee))
* **sifrr-api:** default base path is added before each route ([54b1c8e](https://github.com/sifrr/sifrr/commit/54b1c8e5b4f6d91fbe922cd3383288c80ccaab0d))
* **sifrr-cli:** Don't use use-shadow-root attribute ([d56a6c8](https://github.com/sifrr/sifrr/commit/d56a6c828d673895d3d2957e3c42b5c40673d4f4))
* **sifrr-dom:** Add listener on window instead of document ([bfda60b](https://github.com/sifrr/sifrr/commit/bfda60bc207813185c3cd62f91dd09588f9d2ffe))
* **sifrr-dom:** Don't add script to body except src ones ([638c53b](https://github.com/sifrr/sifrr/commit/638c53b4e12eb643b967ca1ccf29f6520c061143))
* **sifrr-dom:** Don't make text content empty when disconnecting ([f1e3b1e](https://github.com/sifrr/sifrr/commit/f1e3b1e1befdc810f7486a8ca5944501b9805848))
* **sifrr-dom:** Don't treat style attribute differently ([aacb43e](https://github.com/sifrr/sifrr/commit/aacb43eb497cca8ef8c9d0b3990e342da10f0c0c))
* **sifrr-dom:** fix clear perfornmace ([9a96838](https://github.com/sifrr/sifrr/commit/9a968382d7949ee3e96f564605c1cb7bf721a4c6))
* **sifrr-dom:** Fix repeat with sifrr element bug ([ea295b3](https://github.com/sifrr/sifrr/commit/ea295b30fa87b80d1c2c573f2a4d22119101f642))
* **sifrr-dom:** Fix sifrr-element in simple-element bug ([7fb0c82](https://github.com/sifrr/sifrr/commit/7fb0c828a1e65997ff860be2152c4ac902060549))
* **sifrr-dom:** Fix target in event listener fxn execution ([bc899f6](https://github.com/sifrr/sifrr/commit/bc899f6b4d530a9d80e751da0d7e708763e225c8))
* **sifrr-dom:** Fix Treewalker loop bug ([b88d792](https://github.com/sifrr/sifrr/commit/b88d7929cbd0fa60de9f8693a61edc9958437722))
* **sifrr-dom:** Make TW filter fxn simpler ([711a24a](https://github.com/sifrr/sifrr/commit/711a24a6b0b4167ae55a704211ef56f61cc0c585))
* **sifrr-dom:** remove no content option, but make it work without any template ([27d0579](https://github.com/sifrr/sifrr/commit/27d0579cb8c437003e0ee394af838d4eb2533916))
* **sifrr-dom:** Remove redundant checking for attribute specified ([6c6ada9](https://github.com/sifrr/sifrr/commit/6c6ada97d4fef80624c47c27eb5f254c4c90d447))
* **sifrr-dom:** Remove redundant checking for node exists ([c1a767f](https://github.com/sifrr/sifrr/commit/c1a767fd780b199510adb2f9c42c543528868f81))
* **sifrr-dom:** Remove relativeTo method ([75741ed](https://github.com/sifrr/sifrr/commit/75741ed6214921e1dbb12d7b5ab7d7892d1632f2))
* **sifrr-dom:** Removes attribute if value is falsy ([c268e3c](https://github.com/sifrr/sifrr/commit/c268e3c51eadcb5f1de7ab8d8848cee1780c89cd))
* **sifrr-dom:** Show element name whose js it is fetching ([efe96d2](https://github.com/sifrr/sifrr/commit/efe96d2100474caca3e647f147f338c5418ac26d))
* **sifrr-dom:** sifrr element not rendering in arrayToDom ([f9f1749](https://github.com/sifrr/sifrr/commit/f9f1749c70fe011cb743101b58bb270489bb2c76))
* **sifrr-dom:** Throw error if element already defined ([c15eed9](https://github.com/sifrr/sifrr/commit/c15eed98dddc6e0f51c9830a99b913a69492fb30))
* **sifrr-dom:** Throw error on register element error ([bdfdac5](https://github.com/sifrr/sifrr/commit/bdfdac5b7000856f8d56e4fa0decc70246004915))
* **sifrr-dom:** Try to get js file before html ([db49c8f](https://github.com/sifrr/sifrr/commit/db49c8fd882f0c2445750a9d2310520be32f0797))
* **sifrr-dom:** Use shadyCSS if available, and don't use use-shadow-root attribute ([4db2e10](https://github.com/sifrr/sifrr/commit/4db2e10b1019c51977d1e74e3001ca94cd769429))
* **sifrr-route:** Directly assign state of element instead of attribute ([2046c35](https://github.com/sifrr/sifrr/commit/2046c35e3e750bf766a186506834b2410d1885ec))
* **sifrr-route:** Don't use history API when not available ([7ecf792](https://github.com/sifrr/sifrr/commit/7ecf792be1869fe26a53ad508c7aed5befd559fa))
* **sifrr-route:** Show no animation by default ([a182e6d](https://github.com/sifrr/sifrr/commit/a182e6da355a9f2c250443408ec88386c2c3698e))
* **sifrr-route:** Use composed path instead of path to support safari ([ace938f](https://github.com/sifrr/sifrr/commit/ace938ff0fc20c1c368c9929c70f542f32a6cb5d))
* **sifrr-seo:** Don't return from cache if there is no cache ([68099e1](https://github.com/sifrr/sifrr/commit/68099e1232c103a47164f6fbf725994c929df58f))
* **sifrr-seo:** don't set footer in render ([938bba7](https://github.com/sifrr/sifrr/commit/938bba7d8d3a1f917d2e63158f65aa3637a5234c))
* **sifrr-seo:** Fix error on node 8 ([7db1ab2](https://github.com/sifrr/sifrr/commit/7db1ab220ea907d815fd9017f9d7e3cf7c4e6339))
* **sifrr-seo:** Fix pending resolver bug ([1db1e95](https://github.com/sifrr/sifrr/commit/1db1e95349ad0562664ab67b4d816c5a8e15dec5))
* **sifrr-seo:** Fix variables not parsing ([db201f5](https://github.com/sifrr/sifrr/commit/db201f568cc105b8ea2947be283b40cb262bf31a))
* Make babel.config.js work ([aedc697](https://github.com/sifrr/sifrr/commit/aedc69783590656e27fc6aa259a2b2963cc0b8d0))
* **sifrr-seo:** Move puppeteer config to renderer ([59276a6](https://github.com/sifrr/sifrr/commit/59276a6180e687dcecd94a1c88aa21f897e92f74))
* **sifrr-seo:** Pass rendering error to express's next ([8663605](https://github.com/sifrr/sifrr/commit/8663605922182b84137f348bd65220ef9359ef20))
* **sifrr-storage:** Check for openDatabase in webSQL ([d92d437](https://github.com/sifrr/sifrr/commit/d92d4379bcad15e2cad2be55e0145a16c2cf4159))
* **sifrr-storage:** Replace unnecessary let with const ([5396521](https://github.com/sifrr/sifrr/commit/5396521fff3786bf9f1918937c84785f2a7ed84e))
* **sifrr-storage:** Return null if null ([aa8e7ba](https://github.com/sifrr/sifrr/commit/aa8e7bae825f2e7bf7e49d3b92958a39783bff25))


### Features

* **sifrr-api:** Add description ([e1075ca](https://github.com/sifrr/sifrr/commit/e1075ca63101236b910a456e8bea4523700a1478))
* **sifrr-api:** Add schema saving to file ([1f299fc](https://github.com/sifrr/sifrr/commit/1f299fc4ac7aa65719c6c9af01d6abe3bd1f2240))
* **sifrr-api:** Only edit schema file if content has changed ([e2de504](https://github.com/sifrr/sifrr/commit/e2de504e685aedf6ddfa9756c71b1eba876c528b))
* **sifrr-api:** separate model and connection and implement relay ([6b64627](https://github.com/sifrr/sifrr/commit/6b64627c6bce3645ce752367cd3f6414af20f798))
* **sifrr-cli:** Update element:generate to create js ([cebe29a](https://github.com/sifrr/sifrr/commit/cebe29ab2b27f94271c9cac0b61271e52d3c28bb))
* **sifrr-dom:** Add $ & $$ to all elements, fix make equal call ([b7c21b3](https://github.com/sifrr/sifrr/commit/b7c21b3ff04725807172c9f4a478399c21194170))
* **sifrr-dom:** Add awesome event handling and use _ instead of $ in attribute name ([166f48c](https://github.com/sifrr/sifrr/commit/166f48cf0cf077c80454a7e1683767db35e4ad49))
* **sifrr-dom:** Add dom argument to event listener ([c96a66b](https://github.com/sifrr/sifrr/commit/c96a66bb481839393dea4ba7b0318149de6c2a83))
* **sifrr-dom:** Add keyed implementation ([#48](https://github.com/sifrr/sifrr/issues/48)) ([e2155d4](https://github.com/sifrr/sifrr/commit/e2155d43e46485d4352134a210d4e782f35fae31))
* **sifrr-dom:** Add on update hook ([021d027](https://github.com/sifrr/sifrr/commit/021d0277da441a9a11fef993805671c9b7d9f3e5))
* **sifrr-dom:** Add onProgress to loader ([4186e67](https://github.com/sifrr/sifrr/commit/4186e67ff6dab886dc3c3b0d51e0b4e81b9ecd1e))
* **sifrr-dom:** Add option to have element without any content ([f28fcea](https://github.com/sifrr/sifrr/commit/f28fceafc43be623dc9126852c9b43dd68340d90))
* **sifrr-dom:** Add source url to executing scripts for error trace ([87b6277](https://github.com/sifrr/sifrr/commit/87b62777ce714df72f556b015816eed856a882a8))
* **sifrr-dom:** bind event listener to element if this function ([692033b](https://github.com/sifrr/sifrr/commit/692033b257b010837c0ae41983bb17f7856b1931))
* **sifrr-dom:** Improve binding execution ([0a7e182](https://github.com/sifrr/sifrr/commit/0a7e182a2c7604c3ac7e189cfe156d53d2de8f1e))
* **sifrr-dom:** Make state binding separate ([#56](https://github.com/sifrr/sifrr/issues/56)) ([05a583e](https://github.com/sifrr/sifrr/commit/05a583efae4800f5ed16b2aa57f02a21cce8d9bc))
* **sifrr-dom:** Parse style separately than normal attributes ([#22](https://github.com/sifrr/sifrr/issues/22)) ([6e2d200](https://github.com/sifrr/sifrr/commit/6e2d200acf268aa603993c1614ee64074447dff7))
* **sifrr-dom:** Remove oldState tracking for simpleElement ([0a6712e](https://github.com/sifrr/sifrr/commit/0a6712e351abbe54e6af5a5db00ae655c5552ff0))
* **sifrr-dom:** Rename Sifrr.Dom.html to template ([fa7f736](https://github.com/sifrr/sifrr/commit/fa7f73662a76b8a6951bada78679d874b5faa7cc))
* **sifrr-dom:** Save binding functions instead of text ([#43](https://github.com/sifrr/sifrr/issues/43)) ([e6e13e3](https://github.com/sifrr/sifrr/commit/e6e13e3d90a5ebad7c7a84bfbb84995aa4f2ff65))
* **sifrr-dom:** State should be immutable while cloning ([9864ea0](https://github.com/sifrr/sifrr/commit/9864ea0c7e3e9770f8ac0700bab5db6ed5ea0100))
* **sifrr-dom:** Take template as data-html ([0bbebbf](https://github.com/sifrr/sifrr/commit/0bbebbf865a2cdd88d5deb521ee3a346494c7f1b))
* **sifrr-dom:** Warn when element is not registered after executing scripts ([d6307ef](https://github.com/sifrr/sifrr/commit/d6307efb584b5445da49a9691e3ef2add682da14))
* **sifrr-fetch:** Add middleware to fetch ([4b7e572](https://github.com/sifrr/sifrr/commit/4b7e572f71a4ba9eceafbdfcea04db71494f88e9))
* **sifrr-fetch:** Add progress option ([ce2bb64](https://github.com/sifrr/sifrr/commit/ce2bb64d24a5306949f5f065b5e8d5d6d10b536c))
* **sifrr-route:** Add onactivation and ondeactivation callbacks ([9596993](https://github.com/sifrr/sifrr/commit/95969939643f028a1b139601e8acdb8a52d73e05))
* **sifrr-route:** Add support for regex groups ([19bbb85](https://github.com/sifrr/sifrr/commit/19bbb857f6cfc092d6acba647d4e91a7d64a8837))
* **sifrr-route:** change attribute from data-sifrr-path to plain path ([2d988dc](https://github.com/sifrr/sifrr/commit/2d988dcc65085f07c85a8ce86194dd2b852e8984))
* **sifrr-route:** Don't refresh routes if link is same as before ([d9c3f81](https://github.com/sifrr/sifrr/commit/d9c3f81573e2959e120e3c00190f1f11795de74f))
* **sifrr-route:** Support hash and query string ([8af76b6](https://github.com/sifrr/sifrr/commit/8af76b6f8348fedcde0a1c99c9c2b7f42ede99f7))
* **sifrr-seo:** Add beforeRender/afterRender functions ([7697596](https://github.com/sifrr/sifrr/commit/76975969b85e8ad021beafb86a8d70845202a90e))
* **sifrr-seo:** Add better caching, and way to use other caches like memcache/redis/etc ([b50fa18](https://github.com/sifrr/sifrr/commit/b50fa18b9b192ae4144131c927ec1976e89de005))
* **sifrr-seo:** Add capability to add puppeteer launch options ([dc56561](https://github.com/sifrr/sifrr/commit/dc56561507e9c11d307214c32a79b3a558e44503))
* **sifrr-seo:** Add footer to ssr html ([33d8783](https://github.com/sifrr/sifrr/commit/33d87837155207a2976db25366c9a12a4df58a03))
* **sifrr-seo:** Add option to blacklist outgoing requests (closes [#38](https://github.com/sifrr/sifrr/issues/38)) ([cad17f3](https://github.com/sifrr/sifrr/commit/cad17f304cd4de0b6ce4937e23f36ddd3aab0225))
* **sifrr-seo:** always get html fron localhost in puppeteer ([02fbe35](https://github.com/sifrr/sifrr/commit/02fbe35ddc3ed27cc7410c5f950c614e8b14b030))
* **sifrr-seo:** Decouple render method from middleware ([cff93ac](https://github.com/sifrr/sifrr/commit/cff93acda634f6ca8bbe67962cf719719f4d2a92))
* **sifrr-seo:** Don't load images and wait for xhr/fetch requests to complete ([f24172b](https://github.com/sifrr/sifrr/commit/f24172bfa6bc93be4c56c2e3c07f423fd1893cc7))
* **sifrr-seo:** Save if should render, in previous requests ([81fe753](https://github.com/sifrr/sifrr/commit/81fe7536e3ce28076e1a7812760f308055c6a6ef))
* **sifrr-seo:** Take cache store as cache parameter ([4a4a2d7](https://github.com/sifrr/sifrr/commit/4a4a2d7213a6c3cd8a2e6ae85ec91f1f169d9501))
* **sifrr-seo:** Take cacheKey as an option ([0455b2f](https://github.com/sifrr/sifrr/commit/0455b2f1ed619d656c69b46597756e4241a66781))
* **sifrr-seo:** Whitelist instead of blacklist ([4f03906](https://github.com/sifrr/sifrr/commit/4f03906ac18944a4adc3018b86661172d62764c3))
* **sifrr-serviceworker:** Add cache_and_update policy ([3169670](https://github.com/sifrr/sifrr/commit/3169670a9bdcdb158f7179c35d148ce0999457e0))


### Performance Improvements

* **sifrr-dom:** Improve event performance ([fcbeedf](https://github.com/sifrr/sifrr/commit/fcbeedf82664e6fc40728d72ebec31737be5ff6b))
* **sifrr-dom:** Improve simple element perf ([1064d2b](https://github.com/sifrr/sifrr/commit/1064d2b4abac8b5bfec7830f2940f1a21327613f))
* **sifrr-dom:** Improve template calling performace in useShadowRoot ([2f53897](https://github.com/sifrr/sifrr/commit/2f538973e4b47f442f88fad78d6e792d9d232931))
* **sifrr-dom:** Improve update performance ([89a61ec](https://github.com/sifrr/sifrr/commit/89a61ec867cb842168cf25ca4bd6de54834ebadb))
* **sifrr-dom:** Make makeequal work with nodes ([5d98d09](https://github.com/sifrr/sifrr/commit/5d98d09b95ac5640f57642aacb3768e9f022d515))
* **sifrr-seo:** Always keep browser open and cache rendered html ([be70607](https://github.com/sifrr/sifrr/commit/be7060705a32539e44b732ba67b4b630dde93586))



## 0.0.1-alpha2 (2019-01-10)



