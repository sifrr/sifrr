# sifrr-api · [![npm version](https://img.shields.io/npm/v/@sifrr/api.svg)](https://www.npmjs.com/package/@sifrr/api) [![Doscify](https://img.shields.io/badge/API%20docs-Docsify-red.svg)](https://sifrr.github.io/sifrr/#/./packages/server/sifrr-api/)

[NOTE]: old version is deprecated

Please use `typegraphql` and `typeorm` with `sifrr-api` to build graphql apis using typescript.

## API

### saveSchema

Keeps track of graphql schema with versioning to keep track of when the api was changed. Much like db migrations.
Ideally you will run this command whenever you change the graphql schema, and save the schemas in your version control system.

```js
saveSchema(executableSchema, {
  schemaDir: path.resolve('./schema'), // directory path where schema files will be saved
  printOptions?: // options to be given to `printSchema` command of graphql
});
```
