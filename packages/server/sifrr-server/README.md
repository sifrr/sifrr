# sifrr-server · [![npm version](https://img.shields.io/npm/v/@sifrr/server.svg)](https://www.npmjs.com/package/@sifrr/server)

NodeJS Server based on [uWebSocket.js](https://github.com/uNetworking/uWebSockets.js) with extended API to create static/api server.

## Features

-   Extends uWebSocket.js
-   Simple static file serving
-   Simple post request data and form data handling

## How to use

Do `npm i @sifrr/server` or `yarn add @sifrr/server` or add the package to your `package.json` file.

## Api

### Basic usage

Sifrr Server extends 'uWebSockets.js' package. You can view more details [here](https://github.com/uNetworking/uWebSockets.js). So all the APIs from uWS works with sifrr server.

```js
const { App, SSLApp } = require('@sifrr/server');
```

-   `App` extends uWS.App
-   `SSLApp` extends uWS.SSLApp

## Extra APIs than uWS

### writeHeaders

```js
const { App, writeHeaders } = require('@sifrr/server');

const app = new App();
app.get('/', res => {
  writeHeaders(res, name, value); // single header
  writeHeaders(res, {
    name1: value1,
    name2: value2
  }); // multiple headers
});
```

### sendFile

respond with file from filepath. sets content-type based on file name extensions, supports responding 304 based on if-modified-since headers, compression(gzip, brotli, deflate), range requests (videos, music etc.)

```js
const { sendFile } = require('@sifrr/server');

const app = new App();
app.get(uWSRoutingPattern, res => {
  sendFile(res, filepath, options)
});
```

-   `options`:
    -   `lastModified`: **default: `true`** responds with `304 Not Modified` for non-modified files if this is set to true
    -   `headers`: **default:** `{}` Additional headers to set on response ,
    -   `compress`: **default:** `true` responses are compressed if this is set to true and if `accept-encoding` header has supported compressions (gzip, brotli, deflate)
    -   `compressionOptions` **default:** `{ priority: [ 'gzip', 'br', 'deflate' ] }` which compression to use in priority

### host static files

-   Single file (alias for sendFile example above)

file from filepath will be server for given pattern

```js
app.file(uWSRoutingPattern, filepath, options); // options are sendFile options
```

-   Folder

Whole folder will be server recursively under giver prefix

```js
app.folder(prefix, folder, options); // options are sendFile options

// Example
// if you have a file named `example.html` in folder `folder`, then doing this
app.folder('/example', folder);
// will serve example.html if you go to `/example/example.html`
```

### Post requests

for post responses there are extra helper methods added to uWS response object (res is a response object given by Sifrr Server on post requests):

-   `res.body().then(body => /* do something */)`: gives post body as buffer
-   `res.bodyStream()`: Gives post body stream
-   `res.json().then(jsonBody => /* do something */)`: gives post body as json if content-type is `application/json` (this method is only set if post body content-type is `application/json`)

-   `res.formData().then(data => /* do something */)` (only set if content-type is `application/x-www-form-urlencoded` or `multipart/form-data`)

```js
res.formData(options).then(data => {
  // example data
  // {
  //   file: {
  //     filename: 'name.ext',
  //     encoding: '7bit',
  //     mimetype: 'application/json',
  //     filePath: 'tmpDir/name.ext' // only set if tmpDir is given
  //   },
  //   fieldname: value
  // }
})
```

options need to have atleast one of `onFile` function or `tmpDir` if body has files else request will timeout and formData() will never resolve.

-   if `onFile` is set, then it will be called with `fieldname, file, filename, encoding, mimetype` for every file uploaded, where file is file stream, you need to consume it or the request will never resolve
-   if `tmpDir` is given (folder name), files uploaded will be saved in tmpDir, and filePath will added in given data
-   `onField` (optional): will be called with `fieldname, value` if given

## Examples

Are available in [test/public/benchmarks/sifrr.js](./test/public/benchmarks/sifrr.js)

### graphql server

```js
app.post('/graphql', res => {
  res.onAborted(err => { throw err; });

  res.json().then(({ query, variables }) => {
    res.end(JSON.stringify(graphql({
      schema: executableSchema,
      source: query,
      variableValues: variables,
      context: { /* set context */ }
    })));
  });
});
```
