## [0.0.9](https://github.com/sifrr/sifrr/compare/v0.0.8...v0.0.9) (2020-12-21)

### Bug Fixes

- dependencies ([99ee4e4](https://github.com/sifrr/sifrr/commit/99ee4e49c6c8d15c4bfde8c8fe78c0aff25e3b59))

## [0.0.8](https://github.com/sifrr/sifrr/compare/v0.0.7...v0.0.8) (2020-11-12 15:25:53 +0000)

## [0.0.7](https://github.com/sifrr/sifrr/compare/v0.0.6...v0.0.7) (2020-11-10 16:57:32 +0000)

### Bug Fixes

- `register` always returns a promise ([93c3165](https://github.com/sifrr/sifrr/commit/93c31650fb2ea8fde2c6b1ac122eaa9e45bd4cd9))
- bubble only bubblable events ([8fdf844](https://github.com/sifrr/sifrr/commit/8fdf844084a2a282865a9ac80080d68b5db918fc))
- call event listener only on target ([a91784f](https://github.com/sifrr/sifrr/commit/a91784f492c32791d06f03707459f64a1cf1aa62))
- don't set global.Sifrr.Dom on setup ([cce028c](https://github.com/sifrr/sifrr/commit/cce028c2026d2c82ec574d0b8e7254a0c3a00bf4))
- remove synced attrs when you already have props ([3436508](https://github.com/sifrr/sifrr/commit/343650838a41504f028e23c5de0abcd50b04536f))
- state prop change doesn't trigger update bug ([9123a1c](https://github.com/sifrr/sifrr/commit/9123a1c1d8fa607425a70b65972654bfc94d8796))

### Features

- :sifrr-bind can take function too ([830c413](https://github.com/sifrr/sifrr/commit/830c413e4f27be5d0c81f71c537fa3727e0c99d7))
- [BREAKING] convert sifrr attributes to props ([940c707](https://github.com/sifrr/sifrr/commit/940c7072b69dea003227022dc76c6ed9f75f051e))
- add bindStoresToElement function ([e2169c9](https://github.com/sifrr/sifrr/commit/e2169c9992690538ed6d7eb45eabf6c349815e38))
- add on update to store ([03d96b3](https://github.com/sifrr/sifrr/commit/03d96b3ac4fd92a753a37dbb0dc8f3325a5b9a3f))
- add onPropsChange function ([48f729e](https://github.com/sifrr/sifrr/commit/48f729e577cee1e3e4feaa51b0a1e1b1ba3e684c))
- add update in store ([e659cc9](https://github.com/sifrr/sifrr/commit/e659cc9ee93f1ade214825fbcb87f9ef57610836))
- all sifrr props are prefixed with `sifrr` (`sifrrKey`, `sifrrDefaultState`) ([9efa5cd](https://github.com/sifrr/sifrr/commit/9efa5cdf57d27a094f9fc46240a470f431dcd233))
- change data-sifrr-key to :key ([3ed1fdf](https://github.com/sifrr/sifrr/commit/3ed1fdfc8e7e3d1bf3281b090e00cc3b394c6455))
- config can have url function that returns element url ([88b4e4c](https://github.com/sifrr/sifrr/commit/88b4e4c226d37b39ff9fbfaf47db19a6b978d8fc))
- convert to es6 module syntax ([58454fa](https://github.com/sifrr/sifrr/commit/58454fa4ef198e4aa9f1a047473cdb7abdc20c84))
- data-sifrr-repeat is now `:sifrr-repeat` prop ([57bedf6](https://github.com/sifrr/sifrr/commit/57bedf623ac06bd8fec3f92f5b4cadf099569115))
- fix: style prop works now ([c337ec4](https://github.com/sifrr/sifrr/commit/c337ec4ba5c16d1993f23f578a362726816d69ce))
- migrate to typescript ([#266](https://github.com/sifrr/sifrr/issues/266)) ([25793d8](https://github.com/sifrr/sifrr/commit/25793d809d9dfcedd50acf420454d8bcad4db28f))
- props with `:` prefixes ([0c30b87](https://github.com/sifrr/sifrr/commit/0c30b87bad40fe0c995a3269bb43d0d638f53304))
- props work with normal string values without bindings ([6da9dd4](https://github.com/sifrr/sifrr/commit/6da9dd4b5c711d9d53611a93d2592563a64015b0))
- render-if prop, that stops element from render/showing ([eaa5afa](https://github.com/sifrr/sifrr/commit/eaa5afadbb3108e2c463ee5ae9b038f5ef97a2fb))
- replace templating engine with @sifrr/template ([#300](https://github.com/sifrr/sifrr/issues/300)) ([8dafe10](https://github.com/sifrr/sifrr/commit/8dafe1089ddd882b58c11479913cfa2250b59d49))
- setState, getState instead of getter/setter ([2db75b4](https://github.com/sifrr/sifrr/commit/2db75b4ad39d2c0f9368ea185c497cd2283b30f4))

## [0.0.6](https://github.com/sifrr/sifrr/compare/v0.0.5...v0.0.6) (2019-07-27 19:15:42 +0000)

### Bug Fixes

- update value of inputs only if changed ([d02360e](https://github.com/sifrr/sifrr/commit/d02360e02252eaa0519c2dcea4312cd54b790c88))

### Features

- add `root` property which gives parent sifrr element ([f5c5c9d](https://github.com/sifrr/sifrr/commit/f5c5c9d499b881998f892c6496ba8a4ebb5f2da8))
- add basic hooks ([f5208e1](https://github.com/sifrr/sifrr/commit/f5208e111cc2fc4d76839146ed10e4688d0e6320))
- make hooks work with other types, array too ([c068fb3](https://github.com/sifrr/sifrr/commit/c068fb35d324d6794a62c0bf52d36e06cd7b6b4a))
- rename hook to store ([4981b71](https://github.com/sifrr/sifrr/commit/4981b71512b439621e9f562800beb519de619527))
- set custom name for element on register ([1e5435b](https://github.com/sifrr/sifrr/commit/1e5435bb85eb9b4bedf918a024ad088ec5512796))
- template can take (html, style) as argument ([2a17d08](https://github.com/sifrr/sifrr/commit/2a17d08e1d7efee67a20106001404586af1a3d55))

## [0.0.5](https://github.com/sifrr/sifrr/compare/v0.0.4...v0.0.5) (2019-05-20 17:36:45 +0900)

### Features

- add js execution function ([0186437](https://github.com/sifrr/sifrr/commit/018643754ad70ede8b56cf77552987811b8a03c0))
- add Listener can take element as well ([e7662d4](https://github.com/sifrr/sifrr/commit/e7662d43a3b650f54ddb128e150fbaa2fa3aec5f))
- add root reference in repeated refs ([d5fbd62](https://github.com/sifrr/sifrr/commit/d5fbd6276714ae07a9ef833354eb4a0b6467d21f))
- add syncedAttrs ([d9dc170](https://github.com/sifrr/sifrr/commit/d9dc170b2f22f1b52e36f42fa0c1f8abbd31bdce))
- add two way binding between element states ([bd20eab](https://github.com/sifrr/sifrr/commit/bd20eab795de37c115144f05a6ea84fd7e5860a2))
- don't give error if element has no state ([e99e5ea](https://github.com/sifrr/sifrr/commit/e99e5eaf1153fccdcbccbbee8132c0e5f7ec95a8))
- set connected status for element ([014df65](https://github.com/sifrr/sifrr/commit/014df653d33cb31af0d3a9e1e8d41b36231c2434))
- set global sifrr.dom on setup ([4335bbd](https://github.com/sifrr/sifrr/commit/4335bbd91d5f2abab2850b845bf88799c0200fb6))
- strings also work as element template ([bf96a41](https://github.com/sifrr/sifrr/commit/bf96a41a8e16036e9148b91d6bfdca2f6263b05b))
- warn if name already taken ([098d54e](https://github.com/sifrr/sifrr/commit/098d54e81d1307c3c0e9ba47a10f03bd6399795c))

### Performance Improvements

- cache text node values ([45e6531](https://github.com/sifrr/sifrr/commit/45e6531e177c1c29ab76ac3e86cf48e9c5f9dcf4))
- iterate backwards in arrays ([fe5efa5](https://github.com/sifrr/sifrr/commit/fe5efa51bc57dfeb0d801f110ecec1f5a5013fd2))
- trigger update only when there is listener ([6a736d9](https://github.com/sifrr/sifrr/commit/6a736d909656c1498f57bc9b1bff2d287ea8fe2d))
- use array state maps for events and attributes ([cfdd514](https://github.com/sifrr/sifrr/commit/cfdd51410222c04b8aa02cdee4b34cec198edb0b))

## [0.0.4](https://github.com/sifrr/sifrr/compare/v0.0.3...v0.0.4) (2019-04-08 01:10:18 +0900)

### Bug Fixes

- fix event error message ([70c510f](https://github.com/sifrr/sifrr/commit/70c510f44ea97ddb08bf55dbc7b14053104d75b3))
- fix keyed couldn't add elements in front ([efbced4](https://github.com/sifrr/sifrr/commit/efbced403ca7e7d8bdb9bf453f5de30510eac21b))
- only bind event attribute if it has ${} ([2bc019e](https://github.com/sifrr/sifrr/commit/2bc019e5a40b5efc0f49c589dbec828b330e5c53))
- remove dependency on isHtml from nextNode ([2e116d7](https://github.com/sifrr/sifrr/commit/2e116d73cdd07051acbf2685c29abc833ba822e7))
- treat repeating elements as html bindings ([96103d6](https://github.com/sifrr/sifrr/commit/96103d6f5802bd0fcaccf0b4374f6aa37eedc3eb))
- use diff TW in different creators ([bc05b8f](https://github.com/sifrr/sifrr/commit/bc05b8f750a6bcc3710a1c7822a84bec906b5a0a))

### Features

- add before update callback ([d136c8f](https://github.com/sifrr/sifrr/commit/d136c8f3dc8925e0c8f524dad3c5ae013186215f))
- add error if event listener is not added ([6170c73](https://github.com/sifrr/sifrr/commit/6170c7342f45fdd7bab7cf039af842ead975bf07))
- don't clear if there are no childnodes ([dec0909](https://github.com/sifrr/sifrr/commit/dec090903e29d49d90a95f3995b3bf7f7db2d466))
- exec scripts in order ([59247f6](https://github.com/sifrr/sifrr/commit/59247f60b7419888db5d8409e16f475a62f924f2))
- execute js in order ([f19879e](https://github.com/sifrr/sifrr/commit/f19879e2c410b53219e06fd3e88fd1c92d838c5b))
- expose makeequal fxns ([026821d](https://github.com/sifrr/sifrr/commit/026821d796e23e0450fa22f81380a2c66850dcef))
- improve two-way binding and script loader ([8aa3a2d](https://github.com/sifrr/sifrr/commit/8aa3a2dea515c54add45d0bf0ec4f4c8c1198e97))
- make function execution async ([2eee675](https://github.com/sifrr/sifrr/commit/2eee6755c053ed18970a39d72674429489dbc47c))
- remove dependency on sifrr-fetch, use fetch ([1c64ec0](https://github.com/sifrr/sifrr/commit/1c64ec06d6831d351a8a94739dd0ddb3b54e4f2e))
- simplify sifrrClone and deep clone intelligently ([9819ab3](https://github.com/sifrr/sifrr/commit/9819ab31a21b7731edeb861d64861825a18fa67c))
- trigger update event on updated element ([ff64ae2](https://github.com/sifrr/sifrr/commit/ff64ae2914a0155c87f085630723d73feaf7a602))

### Performance Improvements

- directly access \_state to avoid function call ([9ba19d2](https://github.com/sifrr/sifrr/commit/9ba19d20443021390883adbca028fbf132e04f2e))
- improve event listeners ([8381454](https://github.com/sifrr/sifrr/commit/8381454b590bd45495116104c1a06c3ea3caf6b6))
- update property for class,id,value attribute ([215fd7a](https://github.com/sifrr/sifrr/commit/215fd7adee8fd7674dfa3d45317ab46816810f78))

## [0.0.3](https://github.com/sifrr/sifrr/compare/v0.0.1-alpha2...v0.0.3) (2019-03-05 23:44:39 +0900)

### Bug Fixes

- Add listener on window instead of document ([bfda60b](https://github.com/sifrr/sifrr/commit/bfda60bc207813185c3cd62f91dd09588f9d2ffe))
- Don't add script to body except src ones ([638c53b](https://github.com/sifrr/sifrr/commit/638c53b4e12eb643b967ca1ccf29f6520c061143))
- Don't make text content empty when disconnecting ([f1e3b1e](https://github.com/sifrr/sifrr/commit/f1e3b1e1befdc810f7486a8ca5944501b9805848))
- Don't treat style attribute differently ([aacb43e](https://github.com/sifrr/sifrr/commit/aacb43eb497cca8ef8c9d0b3990e342da10f0c0c))
- fix clear perfornmace ([9a96838](https://github.com/sifrr/sifrr/commit/9a968382d7949ee3e96f564605c1cb7bf721a4c6))
- Fix repeat with sifrr element bug ([ea295b3](https://github.com/sifrr/sifrr/commit/ea295b30fa87b80d1c2c573f2a4d22119101f642))
- Fix sifrr-element in simple-element bug ([7fb0c82](https://github.com/sifrr/sifrr/commit/7fb0c828a1e65997ff860be2152c4ac902060549))
- Fix target in event listener fxn execution ([bc899f6](https://github.com/sifrr/sifrr/commit/bc899f6b4d530a9d80e751da0d7e708763e225c8))
- Fix Treewalker loop bug ([b88d792](https://github.com/sifrr/sifrr/commit/b88d7929cbd0fa60de9f8693a61edc9958437722))
- Make TW filter fxn simpler ([711a24a](https://github.com/sifrr/sifrr/commit/711a24a6b0b4167ae55a704211ef56f61cc0c585))
- remove no content option, but make it work without any template ([27d0579](https://github.com/sifrr/sifrr/commit/27d0579cb8c437003e0ee394af838d4eb2533916))
- Remove redundant checking for attribute specified ([6c6ada9](https://github.com/sifrr/sifrr/commit/6c6ada97d4fef80624c47c27eb5f254c4c90d447))
- Remove redundant checking for node exists ([c1a767f](https://github.com/sifrr/sifrr/commit/c1a767fd780b199510adb2f9c42c543528868f81))
- Remove relativeTo method ([75741ed](https://github.com/sifrr/sifrr/commit/75741ed6214921e1dbb12d7b5ab7d7892d1632f2))
- Removes attribute if value is falsy ([c268e3c](https://github.com/sifrr/sifrr/commit/c268e3c51eadcb5f1de7ab8d8848cee1780c89cd))
- Show element name whose js it is fetching ([efe96d2](https://github.com/sifrr/sifrr/commit/efe96d2100474caca3e647f147f338c5418ac26d))
- sifrr element not rendering in arrayToDom ([f9f1749](https://github.com/sifrr/sifrr/commit/f9f1749c70fe011cb743101b58bb270489bb2c76))
- Throw error if element already defined ([c15eed9](https://github.com/sifrr/sifrr/commit/c15eed98dddc6e0f51c9830a99b913a69492fb30))
- Throw error on register element error ([bdfdac5](https://github.com/sifrr/sifrr/commit/bdfdac5b7000856f8d56e4fa0decc70246004915))
- Try to get js file before html ([db49c8f](https://github.com/sifrr/sifrr/commit/db49c8fd882f0c2445750a9d2310520be32f0797))
- Use shadyCSS if available, and don't use use-shadow-root attribute ([4db2e10](https://github.com/sifrr/sifrr/commit/4db2e10b1019c51977d1e74e3001ca94cd769429))

### Features

- Add $ & $$ to all elements, fix make equal call ([b7c21b3](https://github.com/sifrr/sifrr/commit/b7c21b3ff04725807172c9f4a478399c21194170))
- Add awesome event handling and use \_ instead of $ in attribute name ([166f48c](https://github.com/sifrr/sifrr/commit/166f48cf0cf077c80454a7e1683767db35e4ad49))
- Add dom argument to event listener ([c96a66b](https://github.com/sifrr/sifrr/commit/c96a66bb481839393dea4ba7b0318149de6c2a83))
- Add keyed implementation ([#48](https://github.com/sifrr/sifrr/issues/48)) ([e2155d4](https://github.com/sifrr/sifrr/commit/e2155d43e46485d4352134a210d4e782f35fae31))
- Add on update hook ([021d027](https://github.com/sifrr/sifrr/commit/021d0277da441a9a11fef993805671c9b7d9f3e5))
- Add onProgress to loader ([4186e67](https://github.com/sifrr/sifrr/commit/4186e67ff6dab886dc3c3b0d51e0b4e81b9ecd1e))
- Add option to have element without any content ([f28fcea](https://github.com/sifrr/sifrr/commit/f28fceafc43be623dc9126852c9b43dd68340d90))
- Add source url to executing scripts for error trace ([87b6277](https://github.com/sifrr/sifrr/commit/87b62777ce714df72f556b015816eed856a882a8))
- bind event listener to element if this function ([692033b](https://github.com/sifrr/sifrr/commit/692033b257b010837c0ae41983bb17f7856b1931))
- Improve binding execution ([0a7e182](https://github.com/sifrr/sifrr/commit/0a7e182a2c7604c3ac7e189cfe156d53d2de8f1e))
- Make state binding separate ([#56](https://github.com/sifrr/sifrr/issues/56)) ([05a583e](https://github.com/sifrr/sifrr/commit/05a583efae4800f5ed16b2aa57f02a21cce8d9bc))
- Parse style separately than normal attributes ([#22](https://github.com/sifrr/sifrr/issues/22)) ([6e2d200](https://github.com/sifrr/sifrr/commit/6e2d200acf268aa603993c1614ee64074447dff7))
- Remove oldState tracking for simpleElement ([0a6712e](https://github.com/sifrr/sifrr/commit/0a6712e351abbe54e6af5a5db00ae655c5552ff0))
- Rename Sifrr.Dom.html to template ([fa7f736](https://github.com/sifrr/sifrr/commit/fa7f73662a76b8a6951bada78679d874b5faa7cc))
- Save binding functions instead of text ([#43](https://github.com/sifrr/sifrr/issues/43)) ([e6e13e3](https://github.com/sifrr/sifrr/commit/e6e13e3d90a5ebad7c7a84bfbb84995aa4f2ff65))
- State should be immutable while cloning ([9864ea0](https://github.com/sifrr/sifrr/commit/9864ea0c7e3e9770f8ac0700bab5db6ed5ea0100))
- Take template as data-html ([0bbebbf](https://github.com/sifrr/sifrr/commit/0bbebbf865a2cdd88d5deb521ee3a346494c7f1b))
- Warn when element is not registered after executing scripts ([d6307ef](https://github.com/sifrr/sifrr/commit/d6307efb584b5445da49a9691e3ef2add682da14))

### Performance Improvements

- Improve event performance ([fcbeedf](https://github.com/sifrr/sifrr/commit/fcbeedf82664e6fc40728d72ebec31737be5ff6b))
- Improve simple element perf ([1064d2b](https://github.com/sifrr/sifrr/commit/1064d2b4abac8b5bfec7830f2940f1a21327613f))
- Improve template calling performace in useShadowRoot ([2f53897](https://github.com/sifrr/sifrr/commit/2f538973e4b47f442f88fad78d6e792d9d232931))
- Improve update performance ([89a61ec](https://github.com/sifrr/sifrr/commit/89a61ec867cb842168cf25ca4bd6de54834ebadb))
- Make makeequal work with nodes ([5d98d09](https://github.com/sifrr/sifrr/commit/5d98d09b95ac5640f57642aacb3768e9f022d515))

## 0.0.1-alpha2 (2019-01-10 13:40:20 +0900)
