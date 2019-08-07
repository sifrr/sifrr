# sifrr-server · [![npm version](https://img.shields.io/npm/v/@sifrr/server.svg)](https://www.npmjs.com/package/@sifrr/server) [![Doscify](https://img.shields.io/badge/API%20docs-Docsify-red.svg)](https://sifrr.github.io/sifrr/#/./packages/server/sifrr-server/)

NodeJS Server based on [uWebSocket.js](https://github.com/uNetworking/uWebSockets.js) with extended API to create static/api server.

## Features

- Extends [uWebSocket.js](https://github.com/uNetworking/uWebSockets.js)
- Simple static file serving with conditional last-modified, compression, cache, live reload support
- Simple post request data, json data and form data handling (file upload, multipart, url-encoded)
- easy graphql server

## How to use

Do `npm i @sifrr/server` or `yarn add @sifrr/server` or add the package to your `package.json` file.
And `npm i uNetworking/uWebSockets.js#v15.11.0` or `yarn add uNetworking/uWebSockets.js#v15.11.0` to install uWebSockets, which is a peerDependency needed.

## Api

### Basic usage

Sifrr Server extends 'uWebSockets.js' package. You can view more details [here](https://github.com/uNetworking/uWebSockets.js). So all the APIs from uWS works with sifrr server.

```js
const { App, SSLApp } = require('@sifrr/server');
```

- `App` extends uWS.App
- `SSLApp` extends uWS.SSLApp

## Extra APIs than uWS

### createCluster

```js
const { createCluster, App } = require('@sifrr/server');
const app = new App();
// do something on app
const app2 = new App();
// do something on app2
createCluster({
  apps: [
    {
      app: app,
      port: 12345
    },
    {
      app: app2,
      ports: [12346, 12347]
    }
  ],
  onListen: (uwsSocket, port) => {
    // this = app for port
    console.log(this, `is listening on port ${port}`);
  }
});
```

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

respond with file from filepath. sets content-type based on [file name extensions](./src/server/mime.js), supports responding 304 based on if-modified-since headers, compression(gzip, brotli, deflate), range requests (videos, music etc.)

```js
const { sendFile } = require('@sifrr/server');

const app = new App();
app.get(uWSRoutingPattern, (res, req) => {
  res.onAborted(e => process.stderr.write(e));
  sendFile(res, req, filepath, options);
});
```

- `options`:
  - `lastModified`: **default: `true`** responds with `304 Not Modified` for non-modified files if this is set to true
  - `headers`: **default:** `{}` Additional headers to set on response ,
  - `compress`: **default:** `false` responses are compressed if this is set to true and if `accept-encoding` header has supported compressions (gzip, brotli, deflate)
  - `compressionOptions` **default:** `{ priority: [ 'gzip', 'br', 'deflate' ] }` which compression to use in priority, and other [zlib options](https://nodejs.org/api/zlib.html#zlib_class_options)
  - `cache`: **default:** `false`, if given a [node-cache-manager](https://github.com/BryanDonovan/node-cache-manager) instance, it will cache the files in given cache. Generally it might not be needed at all, check for performance improvement before using it blindly.

#### Add additional mime type:

```js
const { mimes } = require('@sifrr/server');
mimes['extension'] = 'mime/type';
```

### host static files

- Single file (alias for sendFile example above)

file from filepath will be server for given pattern

```js
app.file(uWSRoutingPattern, filepath, options); // options are sendFile options
```

- Folder

Whole folder will be server recursively under given prefix

```js
app.folder(prefix, folder, options); // options are sendFile options

// Example
// if you have a file named `example.html` in folder `folder`, then doing this
app.folder('/example', folder, options);
// will serve example.html if you go to `/example/example.html`
```

**Extra options**
`overwriteRoute`: if set to `true`, it will overwrite old pattern if same pattern is added.
`failOnDuplicateRoute`: if set to `true`, it will throw error if you try add same pattern again.
By default, it will serve the file you added first with a pattern.
`watch`: if it is `true`, it will watch for new Files / deleted files and serve/unserve them as needed.
`livereload`: default: `false`, [more details here](#live-reload-experimental)

### Post requests

for post responses there are extra helper methods added to uWS response object (res is a response object given by Sifrr Server on post requests), note that as stream can only be used once, only one of these function can be called for one request:

- `res.body().then(body => /* do something */)`: gives post body as buffer
- `res.bodyStream()`: Gives post body stream
- `res.json().then(jsonBody => /* do something */)`: gives post body as json if content-type is `application/json` (this method is only set if post body content-type is `application/json`)
- `res.formData(options).then(data => /* do something */)` (only set if content-type is `application/x-www-form-urlencoded` or `multipart/form-data`)

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
});
```

options need to have atleast one of `onFile` function or `tmpDir` if body has files else request will timeout and formData() will never resolve.

- if `onFile` is set, then it will be called with `fieldname, file, filename, encoding, mimetype` for every file uploaded, where file is file stream, you need to consume it or the request will never resolve
- if `tmpDir` is given (folder name), files uploaded will be saved in tmpDir, and filePath will added in given data
  if `filename` function is given, it will be called with original filename, and name returned will be used when saving in tmpDir.
- `onField` (optional): will be called with `fieldname, value` if given
- other [busboy options](https://github.com/mscdex/busboy#busboy-methods)

Array fields/files:

- if fieldname is `something` and it has multiple values, then `data.something` will be an array else it will be a single value.
- if fieldname is `something[]` then `data.something` will always be an array with >=1 values.

### graphql server

```js
function contextFxn(res, err) {
  // return context value
  return {
    user: {
      id: 1
    }
  }
}

const graphqlSchema = /* get graphql executable schema from somewhere (Javascript one, not graphql dsl) */;

app.graphql('/graphql', graphqlSchema, contextFxn);
```

It supports:

- GET requests with query params (`query` and `variables`) eg. `/graphql?query=query($id: String) { user(id: $id) { id \n name } }&variables={"id":"a"}`

- POST requests with query params (`query` and `variables`) eg. `/graphql?query=query($id: String) { user(id: $id) { id \n name } }&variables={"id":"a"}`

- POST requests with json body (containing `query` and `variables`) eg body:

```js
{
  query: `
    query($id: String) {
      user(id: $id) {
        id
        name
      }
    }`,
  variables: {
    id: 'b'
  }
}
```

### Live reload (experimental)

Live reload, reloads browser page when static files are changed or a signal is sent.

```js
const { livereload, App } = require('@sifrr/server);

const app = new App();
app
  .ws('/livereload', livereload.wsConfig)
  .folder('/live', folderPath, {
    livereload: true // ideally true if development
    // other sendFile options
  });

// send refresh signal programatically, maybe after you have compiled code or something
livereload.sendSignal();

// then in your frontend js file
import livereload from '@sifrr/server/src/livereloadjs';

livereload(`ws://${host}/livereload`); // probably put this inside if development env condition
```

### Load routes

An example route file:

```js
const path = require('path');

const headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': '*',
  Connection: 'keep-alive'
};

module.exports = {
  basePath: '/p', // this preffix will be added to all the routes in this file
  folder: {
    '': [path.join(__dirname, '../public'), { headers, lastModified: false }],
  },
  get: {
    '/some': (res, req) => res.send('ABD');
  }
};
```

You can have multiple route files in a folder, and then you can call

```js
app.load(dirPath, { filter: filepath => true, basePath: '' });
```

And all the routes from the route files in this directory will be added to your app server.

for example the above route file will add following routes:

```js
app.folder('/p', path.join(__dirname, '../public'), { headers, lastModified: false });
app.get('/p/some', (res, req) => res.send('ABD'));
```

`Options`:

- `filter` - this function will be called with all filepaths in directory, and if this returns `true` that route file will be added, else it will be not.
- `basePath` - base path preffix to add for all the routes

## Static server Benchmarks

From [this file](./test/browser/speed.test.js)

```sh
# small static file
┌─────────┬──────┬───────────────┬───────────────┬─────────────┬─────────────────────┐
│ (index) │ rps  │ meanLatencyMs │ totalRequests │ totalErrors │  totalTimeSeconds   │
├─────────┼──────┼───────────────┼───────────────┼─────────────┼─────────────────────┤
│  sifrr  │ 1720 │      4.6      │      500      │      0      │     0.290736455     │
│ express │ 1510 │      5.1      │      500      │      0      │ 0.33112339300000004 │
└─────────┴──────┴───────────────┴───────────────┴─────────────┴─────────────────────┘
# big file
┌─────────┬─────┬───────────────┬───────────────┬─────────────┬────────────────────┐
│ (index) │ rps │ meanLatencyMs │ totalRequests │ totalErrors │  totalTimeSeconds  │
├─────────┼─────┼───────────────┼───────────────┼─────────────┼────────────────────┤
│  sifrr  │ 797 │      10       │      500      │      0      │    0.627346613     │
│ express │ 767 │     10.3      │      500      │      0      │ 0.6518107169999999 │
└─────────┴─────┴───────────────┴───────────────┴─────────────┴────────────────────┘
# big file with gzip compression
┌─────────┬─────┬───────────────┬───────────────┬─────────────┬──────────────────┐
│ (index) │ rps │ meanLatencyMs │ totalRequests │ totalErrors │ totalTimeSeconds │
├─────────┼─────┼───────────────┼───────────────┼─────────────┼──────────────────┤
│  sifrr  │ 397 │     19.9      │      398      │      0      │    1.00134455    │
│ express │ 329 │     24.1      │      329      │      0      │   1.001440561    │
└─────────┴─────┴───────────────┴───────────────┴─────────────┴──────────────────┘
# big file with cache vs normal express
┌─────────┬─────┬───────────────┬───────────────┬─────────────┬────────────────────┐
│ (index) │ rps │ meanLatencyMs │ totalRequests │ totalErrors │  totalTimeSeconds  │
├─────────┼─────┼───────────────┼───────────────┼─────────────┼────────────────────┤
│  sifrr  │ 921 │      8.6      │      500      │      0      │ 0.5427590760000001 │
│ express │ 767 │     10.3      │      500      │      0      │    0.651958354     │
└─────────┴─────┴───────────────┴───────────────┴─────────────┴────────────────────┘
# big file gzip compressin and cache vs normal express with compression
┌─────────┬─────┬───────────────┬───────────────┬─────────────┬────────────────────┐
│ (index) │ rps │ meanLatencyMs │ totalRequests │ totalErrors │  totalTimeSeconds  │
├─────────┼─────┼───────────────┼───────────────┼─────────────┼────────────────────┤
│  sifrr  │ 491 │     16.1      │      493      │      0      │    1.004362406     │
│ express │ 357 │      22       │      358      │      0      │ 1.0017989919999999 │
└─────────┴─────┴───────────────┴───────────────┴─────────────┴────────────────────┘
```

## Examples

Are available in [test/public/benchmarks/sifrr.js](./test/public/benchmarks/sifrr.js)
