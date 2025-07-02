# sifrr-server · [![npm version](https://img.shields.io/npm/v/@sifrr/server.svg)](https://www.npmjs.com/package/@sifrr/server) [![Doscify](https://img.shields.io/badge/API%20docs-Docsify-red.svg)](https://sifrr.github.io/sifrr/#/./packages/server/sifrr-server/)

NodeJS Server based on [uWebSocket.js](https://github.com/uNetworking/uWebSockets.js) with extended API to create static/api server.

## Features

- Extends [uWebSocket.js](https://github.com/uNetworking/uWebSockets.js)
- Static file serving with conditional last-modified, compression, cache support
- Post request data, json data and form data handling (file upload, multipart, url-encoded)
- easy graphql server

## How to use

Do `npm i @sifrr/server` or `yarn add @sifrr/server` or add the package to your `package.json` file.

## Api

### Basic usage

Sifrr Server extends 'uWebSockets.js' package. You can view more details [here](https://github.com/uNetworking/uWebSockets.js). So all the APIs from uWS works with sifrr server.

```js
import { SifrrServer } from '@sifrr/server';
```

## Extra APIs than uWS

### createCluster

```ts
import { launchCluster, SifrrServer } from '@sifrr/server';
const app = new SifrrServer();
// do something on app

launchCluster(app, port, {
  numberOfWorkers?: number;
  restartOnError?: boolean;
  onListen?: (port: number | false) => void;
})
```

### sendFile

respond with file from filepath. sets content-type based on [file name extensions](./src/server/mime.js), supports responding 304 based on if-modified-since headers, compression(gzip, brotli, deflate), range requests (videos, music etc.)

```js
const app = new App();
app.get(uWSRoutingPattern, app.sendFile(filePath, options));
```

- `options`:
  - `filter`: **default** `(path: string) => true` Filter files
  - `lastModified`: **default:** `true` responds with `304 Not Modified` for non-modified files if this is set to true
  - `headers`: **default:** `{}` Additional headers to set on response ,
  - `compress`: **default:** `false` responses are compressed if this is set to true and if `accept-encoding` header has supported compressions (gzip, brotli, deflate)
  - `compressionOptions` **default:** `{ priority: [ 'gzip', 'br', 'deflate' ] }` which compression to use in priority, and other [zlib options](https://nodejs.org/api/zlib.html#zlib_class_options)

### host static files

- Single file (alias for sendFile example above)

file from filepath will be served for given pattern

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

### Post requests

for post responses there are extra helper methods added to uWS response object (res is a response object given by Sifrr Server on post requests), note that as stream can only be used once, only one of these function can be called once for one request:

- `res.body.then(body => /* do something */)`: gives post body as json (if content type is json or formdata) or text
- `res.bodyStream`: Gives post body stream
- `res.bodyBuffer.then(buffer => /* do something */)`: gives post body as buffer

Options:

```ts
{
  /**
   * Path to local disk directory. it will store the uploaded files to local disk if directory is given
   * Path where file is saved will be added to UploadedFile.path
   */
  destinationDir?: string;
  /**
   * Filter function for files, if it return false, files will be ignored.
   */
  filterFile?(fileInfo: UploadedFile): boolean;
  /**
   * Add custom handler for reading file streams, if it is provided buffer/path will not be available in uploaded file info
   */
  handleFileStream?(
    fileInfo: Omit<UploadedFile, 'buffer' | 'destination' | 'path' | 'size'>
  ): void | Promise<void>;
  /**
   * Config for file fields.
   * If undefined, all files and fields are allowed.
   */
  fields?: Partial<
    Record<
      T,
      {
        /** Any files or array fields > maxCount for a field will be ignored */
        /** If max count is >1, field value will always be an array and if it's <= 1 it will always be single value */
        maxCount?: number;
        /** Default value for field */
        default?: string | string[] | UploadedFile | UploadedFile[];
      }
    >
  >;
}
```

and other busboy options

Array fields/files:

- When `fields` is not given, if fieldname is `something` and it has multiple values, then `body.something` will be an array else it will be a single value.
- If `fields.something` max count is >1, field value will always be an array and if it's <= 1 it will always be single value exept when fieldname ends with `[]`
- if fieldname is `something[]` then `body.something` will always be an array with >=1 values.

### graphql server

```js
const graphqlSchema = /* get graphql executable schema from somewhere (Javascript one, not graphql dsl) */;

app.graphql('/graphql', graphqlSchema, otherOptions);
```

It supports:

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

- Websocket subscriptions (same message format as graphql-subscription-ws)

```js
// subscribe message
{
  type: 'start',
  payload: {
    query: ``, // subscription query
    variables: {...}
  }
}

// unsubscribe message
{
  type: 'stop',
  id: 1 // subscription id received when subscribing
}
```

can be implemented easily using sifrr-fetch

## Static server Benchmarks

From [this file](./test/browser/speed.e2e-spec.js) on MacBook 14inch M1 Pro

```sh
# small file
┌─────────┬──────┬───────────────┬───────────────┬─────────────┬──────────────────┐
│ (index) │ rps  │ meanLatencyMs │ totalRequests │ totalErrors │ totalTimeSeconds │
├─────────┼──────┼───────────────┼───────────────┼─────────────┼──────────────────┤
│ sifrr   │ 7267 │ 0.6           │ 20000         │ 0           │ 2.752            │
│ express │ 3731 │ 1.5           │ 18653         │ 0           │ 5                │
└─────────┴──────┴───────────────┴───────────────┴─────────────┴──────────────────┘
# small file with gzip compression
┌─────────┬──────┬───────────────┬───────────────┬─────────────┬──────────────────┐
│ (index) │ rps  │ meanLatencyMs │ totalRequests │ totalErrors │ totalTimeSeconds │
├─────────┼──────┼───────────────┼───────────────┼─────────────┼──────────────────┤
│ sifrr   │ 6386 │ 0.8           │ 20000         │ 0           │ 3.132            │
│ express │ 3957 │ 1.4           │ 19785         │ 0           │ 5                │
└─────────┴──────┴───────────────┴───────────────┴─────────────┴──────────────────┘
# big file
┌─────────┬──────┬───────────────┬───────────────┬─────────────┬──────────────────┐
│ (index) │ rps  │ meanLatencyMs │ totalRequests │ totalErrors │ totalTimeSeconds │
├─────────┼──────┼───────────────┼───────────────┼─────────────┼──────────────────┤
│ sifrr   │ 1618 │ 4.4           │ 8089          │ 0           │ 5                │
│ express │ 1343 │ 5.5           │ 6715          │ 0           │ 5                │
└─────────┴──────┴───────────────┴───────────────┴─────────────┴──────────────────┘
# big file with gzip compression
┌─────────┬─────┬───────────────┬───────────────┬─────────────┬──────────────────┐
│ (index) │ rps │ meanLatencyMs │ totalRequests │ totalErrors │ totalTimeSeconds │
├─────────┼─────┼───────────────┼───────────────┼─────────────┼──────────────────┤
│ sifrr   │ 629 │ 12.2          │ 3147          │ 0           │ 5.001            │
│ express │ 619 │ 12.4          │ 3097          │ 0           │ 5.001            │
└─────────┴─────┴───────────────┴───────────────┴─────────────┴──────────────────┘
```
