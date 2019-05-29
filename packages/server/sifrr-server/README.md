# sifrr-server · [![npm version](https://img.shields.io/npm/v/@sifrr/server.svg)](https://www.npmjs.com/package/@sifrr/server) [![Doscify](https://img.shields.io/badge/API%20docs-Docsify-red.svg)](https://sifrr.github.io/sifrr/#/./packages/server/sifrr-server/)

NodeJS Server based on [uWebSocket.js](https://github.com/uNetworking/uWebSockets.js) with extended API to create static/api server.

## Features

-   Extends [uWebSocket.js](https://github.com/uNetworking/uWebSockets.js)
-   Simple static file serving with conditional last-modified, compression, cache support
-   Simple post request data, json data and form data handling (file upload, multipart, url-encoded)

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

respond with file from filepath. sets content-type based on [file name extensions](./src/server/mime.js), supports responding 304 based on if-modified-since headers, compression(gzip, brotli, deflate), range requests (videos, music etc.)

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
    -   `compress`: **default:** `false` responses are compressed if this is set to true and if `accept-encoding` header has supported compressions (gzip, brotli, deflate)
    -   `compressionOptions` **default:** `{ priority: [ 'gzip', 'br', 'deflate' ] }` which compression to use in priority, and other [zlib options](https://nodejs.org/api/zlib.html#zlib_class_options)
    -   `cache`: **default:** `false`, if given a [node-cache-manager](https://github.com/BryanDonovan/node-cache-manager) instance, it will cache the files in given cache (doesn't work with compression). Also, it might not be needed at all, check for performance improvement before using it blindly.

#### Add additional mime type:

```js
const { mimes } = require('@sifrr/server');
mimes['extension'] = 'mime/type';
```

### host static files

-   Single file (alias for sendFile example above)

file from filepath will be server for given pattern

```js
app.file(uWSRoutingPattern, filepath, options); // options are sendFile options
```

-   Folder

Whole folder will be server recursively under given prefix

```js
app.folder(prefix, folder, options); // options are sendFile options

// Example
// if you have a file named `example.html` in folder `folder`, then doing this
app.folder('/example', folder, options);
// will serve example.html if you go to `/example/example.html`
```

**Extra options**
`overwriteRoute`: if set to `true`, it will overwrite old pattern if same patter is added.
`failOnDuplicateRoute`: if set to `true`, it will throw error if you try add same pattern again.
by default, it will serve the file you added with this pattern

There is one more option available for `folder` with all the sendFile options:
`watch`: if it is `true`, it will watch for new Files / deleted files and serve/unserve them as needed.

### Post requests

for post responses there are extra helper methods added to uWS response object (res is a response object given by Sifrr Server on post requests), note that as stream can only be used once, only one of these function can be called for one request:

-   `res.body().then(body => /* do something */)`: gives post body as buffer
-   `res.bodyStream()`: Gives post body stream
-   `res.json().then(jsonBody => /* do something */)`: gives post body as json if content-type is `application/json` (this method is only set if post body content-type is `application/json`)
-   `res.formData(options).then(data => /* do something */)` (only set if content-type is `application/x-www-form-urlencoded` or `multipart/form-data`)

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
    if `filename` function is given, it will be called with original filename, and name returned will be used when saving in tmpDir.
-   `onField` (optional): will be called with `fieldname, value` if given
-   other [busboy options](https://github.com/mscdex/busboy#busboy-methods)

Array fields:

-   if fieldname is `something` and it has multiple values, then `data.something` will be an array else it will be a single value.
-   if fieldname is `something[]` then `data.something` will always be an array with >=1 values.

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
app.load(dirPath, { filter: (filepath) => true, basePath: '' });
```

And all the routes from the route files in this directory will be added to your app server.

for example the above route file will add following routes:

```js
app.folder('/p', path.join(__dirname, '../public'), { headers, lastModified: false });
app.get('/p/some', (res, req) => res.send('ABD'));
```

`Options`:

-   `filter` - this function will be called with all filepaths in directory, and if this returns `true` that route file will be added, else it will be not.
-   `basePath` - base path preffix to add for all the routes

## Examples

Are available in [test/public/benchmarks/sifrr.js](./test/public/benchmarks/sifrr.js)

### graphql server

```js
function handleError(res, err) {
  res.writeStatus('500 Internal Server Error');
  res.end(JSON.stringify({ name: err.name, message: err.message }));
}

app.post('/graphql', res => {
  res.onAborted(err => handleError(res, err));

  res.json().then(({ query, variables }) =>
    graphql({
      schema: executableSchema,
      source: query,
      variableValues: variables,
      context: { /* set context */ }
    })).then(data => res.end(JSON.stringify(data))).catch(err => handleError(res, err));
});
```
