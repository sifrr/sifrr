## [0.0.8](https://github.com/sifrr/sifrr/compare/v0.0.7...v0.0.8) (2020-11-12)



## [0.0.7](https://github.com/sifrr/sifrr/compare/v0.0.6...v0.0.7) (2020-11-10 16:57:32 +0000)


### Bug Fixes

* only need graphql if it is used ([5b53b9f](https://github.com/sifrr/sifrr/commit/5b53b9f9df245d373beee84657f8023356fae331))
* remove prohibited headers ([849986f](https://github.com/sifrr/sifrr/commit/849986f08933fbf097ea92144218541329a7dc00))


### Features

* add body helpers in put, patch requests ([7cb2861](https://github.com/sifrr/sifrr/commit/7cb286150f9c72ab59e4c9558372f58743ba4575))
* add getQuery function ([bc5845a](https://github.com/sifrr/sifrr/commit/bc5845a4266aaedfe9241c13e350a8d4a540bf8c))
* add graphql subscription support ([f9b0803](https://github.com/sifrr/sifrr/commit/f9b0803557d73eef4ba5faf10264eeb0f26e9cfe))
* auto live reload without any setup ([055cfa4](https://github.com/sifrr/sifrr/commit/055cfa4f10972db3d6fa5e709c1c8c3cd071cf4f))
* convert createCluster to cluster class ([#236](https://github.com/sifrr/sifrr/issues/236)) ([f75daa5](https://github.com/sifrr/sifrr/commit/f75daa5f144882e77de56403c7de2880a512b519))
* migrate to ts ([#319](https://github.com/sifrr/sifrr/issues/319)) ([206b8f1](https://github.com/sifrr/sifrr/commit/206b8f1c2d8756b85fa8030ea57f5008ee6262c6))



## [0.0.6](https://github.com/sifrr/sifrr/compare/v0.0.5...v0.0.6) (2019-07-27 19:15:42 +0000)


### Features

* add createCluster function ([98bca3a](https://github.com/sifrr/sifrr/commit/98bca3a4a3933389fb6ecdb420e30c3d92a53584))
* add graphql server to sifrr-server ([d5efcc2](https://github.com/sifrr/sifrr/commit/d5efcc23c4b75d0984c06fe2b3ab67adef2c5553))
* add livereload feature (experimental) ([fb1005b](https://github.com/sifrr/sifrr/commit/fb1005bec8f96277acf71c1ed06c6968ac8f8acc))
* add options to overwrite/fail on dup static route ([c515745](https://github.com/sifrr/sifrr/commit/c5157451e76e1c221fd019193371550e7950f134))
* cache works for compressed file as well ([c0821e0](https://github.com/sifrr/sifrr/commit/c0821e013838658a33c05e706d19498a54cf038d))
* close watchers on server close ([0cca0a1](https://github.com/sifrr/sifrr/commit/0cca0a125241f35326082d9b864e460216dcbe3d))
* make live reload js importable ([9c29147](https://github.com/sifrr/sifrr/commit/9c29147ccdfed5173a73420359e8d4c24b17a634))
* update uWS.js to 15.11.0 ([dc81e97](https://github.com/sifrr/sifrr/commit/dc81e97f35faaab566329d214f92774b33425039))



## [0.0.5](https://github.com/sifrr/sifrr/compare/v0.0.4...v0.0.5) (2019-05-20 17:36:45 +0900)


### Bug Fixes

* abort passing stream when compressed ([7462264](https://github.com/sifrr/sifrr/commit/7462264473321dee90cc20d43a4fa70b51a7dca5))
* fix mutable headers issue ([026c675](https://github.com/sifrr/sifrr/commit/026c675d19edc0e357c76d7e76c81d5ef0761677))
* return this after close ([e992c38](https://github.com/sifrr/sifrr/commit/e992c383d09b37424b0ed9206b09a3575a8de05b))


### Features

* add option to change filename for tmpdir ([c2a9330](https://github.com/sifrr/sifrr/commit/c2a93307cde3354fba91f4fe5537337d41686f98))
* add optional caching  ([#106](https://github.com/sifrr/sifrr/issues/106)) ([cf74306](https://github.com/sifrr/sifrr/commit/cf743062b42b8ecdbe37f161f0dc3af8db72fe7e))
* change ext methods to mimes/getMime ([724ecb5](https://github.com/sifrr/sifrr/commit/724ecb504814ef5abaa873d12c2ed2aded0808f8))
* clone connection with same resolver if none given ([a3ef846](https://github.com/sifrr/sifrr/commit/a3ef8462bcd787d4a1061ea8edeeadbf2e576211))
* make compress: false as default ([af95e82](https://github.com/sifrr/sifrr/commit/af95e82ca48a239d77d69cb5f844c937ea5ed424))


### Reverts

* Revert "feat(sifrr-dom): make deep twoway binding work" ([205936b](https://github.com/sifrr/sifrr/commit/205936bd4bae1b715867c126885ea145a4ffb1cf))



## [0.0.4](https://github.com/sifrr/sifrr/compare/v0.0.3...v0.0.4) (2019-04-08 01:10:18 +0900)


### Bug Fixes

* content-length for ranged responses ([6612526](https://github.com/sifrr/sifrr/commit/6612526237b85cc5ce3da4c93531263ad8fa06c3))
* don't extend constructor ([9038a1e](https://github.com/sifrr/sifrr/commit/9038a1e779fad3d526bab80e3459ad386cda9096))
* fix serving from basePath ([4d04976](https://github.com/sifrr/sifrr/commit/4d04976238ca302cf215dc825dda07d8f1590d86))
* write headers after compression ([fdd4958](https://github.com/sifrr/sifrr/commit/fdd49581f6fb36d8888f1d9a47e83a8ca3d7969f))


### Features

* add capability to serve single file ([6852531](https://github.com/sifrr/sifrr/commit/6852531447d84439a18febd652ec5d41b012941d))
* add close method ([ea85bfd](https://github.com/sifrr/sifrr/commit/ea85bfdacfa9f33b72a6ebd35db2aa31c3af609c))
* add compression ([509e1dd](https://github.com/sifrr/sifrr/commit/509e1ddf17c2961a9d6613e03d78e9b4094a52d7))
* add load routes function ([7618070](https://github.com/sifrr/sifrr/commit/76180701ca44a80ec5cd0d6a384da1f7e90b4cb8))
* add post body parsing (json, form data) ([560244f](https://github.com/sifrr/sifrr/commit/560244fc3610a7fd509cdde9f69ac4303da850f0))
* add static server with last-modified based 304 ([4540e93](https://github.com/sifrr/sifrr/commit/4540e93d5a86626f2b6f42bec2f1c941664253a1))
* delegate to uws app, add static serving method ([8bc9fa6](https://github.com/sifrr/sifrr/commit/8bc9fa6d22f225abf6d48b1ca408b788497b1c31))
* don't send headers on 304 ([1702009](https://github.com/sifrr/sifrr/commit/1702009e7cd283a4dae3c43d8b198fed2c6bb312))
* handle connection closing, streaming ([0762cb7](https://github.com/sifrr/sifrr/commit/0762cb7e9c937991da36c59166c56ffc4e981359))
* inherit from uws Apps ([330d85a](https://github.com/sifrr/sifrr/commit/330d85a7bcc01990c4873bad586283d508cf56df))
* make sendFile async ([f26cc9d](https://github.com/sifrr/sifrr/commit/f26cc9d4306e2a0955bbfdc93758df560a8f7553))
* only use last modified if set to true ([ed39a1a](https://github.com/sifrr/sifrr/commit/ed39a1aa67d5d277b1adcf9977c1758e6dbd579b))
* serve in ranges of ranges header present ([3658eab](https://github.com/sifrr/sifrr/commit/3658eab219f16753d118725960ba5b7133ff5626))
* watch for new files and deleted files ([2752d48](https://github.com/sifrr/sifrr/commit/2752d48947e1246a609fdc8c4dd6fe57ad3bc1c1))
* watch only when option given ([5ef7703](https://github.com/sifrr/sifrr/commit/5ef77030446caf6d1373ccee3d162df1f329a207))


### Performance Improvements

* clone from typedarray ([abea750](https://github.com/sifrr/sifrr/commit/abea750b02d4677720582f4b85181c66695794cc))
* directly use stream in form data and body ([0af7fb9](https://github.com/sifrr/sifrr/commit/0af7fb9c11709adca47bd1b4b3732e3fd90e5fb4))
* make stream to buffer more efficient ([1d16c9d](https://github.com/sifrr/sifrr/commit/1d16c9d4216b814990684268d47b0d2f71a9d519))



## [0.0.3](https://github.com/sifrr/sifrr/compare/v0.0.1-alpha2...v0.0.3) (2019-03-05 23:44:39 +0900)



## 0.0.1-alpha2 (2019-01-10 13:40:20 +0900)



