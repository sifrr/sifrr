const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const uWS = require('uWebSockets.js');
const chokidar = require('chokidar');

const sendFile = require('./sendfile');
const formData = require('./formdata');
const loadroutes = require('./loadroutes');
const graphqlHandler = require('./graphql');

const contTypes = ['application/x-www-form-urlencoded', 'multipart/form-data'];
const noOp = () => true;
const { stob } = require('./utils');

class BaseApp {
  file(pattern, path, options = {}) {
    if (this._staticPaths[pattern]) {
      if (options.failOnDuplicateRoute)
        throw Error(
          `Error serving '${path}' for '${pattern}', already serving '${
            this._staticPaths[pattern][0]
          }' file for this patter.`
        );
      else if (!options.overwriteRoute) return;
    }

    this._staticPaths[pattern] = [path, options];
    this.get(pattern, this._serveStatic);
    return this;
  }

  folder(prefix, folder, options, base = folder) {
    // not a folder
    if (!fs.statSync(folder).isDirectory()) {
      throw Error('Given path is not a directory: ' + folder);
    }

    // ensure slash in beginning and no trailing slash for prefix
    if (prefix[0] !== '/') prefix = '/' + prefix;
    if (prefix[prefix.length - 1] === '/') prefix = prefix.slice(0, -1);

    // serve folder
    const filter = options ? options.filter || noOp : noOp;
    fs.readdirSync(folder).forEach(file => {
      // Absolute path
      const filePath = path.join(folder, file);
      // Return if filtered
      if (!filter(filePath)) return;

      if (fs.statSync(filePath).isDirectory()) {
        // Recursive if directory
        this.folder(prefix, filePath, options, base);
      } else {
        this.file(prefix + '/' + path.relative(base, filePath), filePath, options);
      }
    });

    if (options && options.watch) {
      if (!this._watched[folder]) {
        const w = chokidar.watch(folder);

        w.on('unlink', filePath => {
          const url = '/' + path.relative(base, filePath);
          delete this._staticPaths[prefix + url];
        });

        w.on('add', filePath => {
          const url = '/' + path.relative(base, filePath);
          this.file(prefix + url, filePath, options);
        });

        this._watched[folder] = w;
      }
    }
    return this;
  }

  _serveStatic(res, req) {
    res.onAborted(noOp);
    const options = this._staticPaths[req.getUrl()];
    if (typeof options === 'undefined') {
      res.writeStatus('404 Not Found');
      res.end();
    } else sendFile(res, req, options[0], options[1]);
  }

  post(pattern, handler) {
    if (typeof handler !== 'function')
      throw Error(`handler should be a function, given ${typeof handler}.`);
    this._post(pattern, (res, req) => {
      const contType = req.getHeader('content-type');

      res.bodyStream = function() {
        const stream = new Readable();
        stream._read = noOp;

        this.onData((ab, isLast) => {
          // uint and then slicing is bit faster than slice and then uint
          stream.push(new Uint8Array(ab.slice(ab.byteOffset, ab.byteLength)));
          if (isLast) {
            stream.push(null);
          }
        });

        return stream;
      };

      res.body = () => stob(res.bodyStream());

      if (contType.indexOf('application/json') > -1)
        res.json = async () => JSON.parse(await res.body());
      if (contTypes.map(t => contType.indexOf(t) > -1).indexOf(true) > -1)
        res.formData = formData.bind(res, contType);

      handler(res, req);
    });
    return this;
  }

  graphql(path, schema, contextFxn, graphql) {
    const handler = graphqlHandler(schema, contextFxn, graphql);
    this.post(path, handler);
    this.get(path, handler);
    return this;
  }

  load(dir, options) {
    loadroutes.call(this, dir, options);
    return this;
  }

  listen(h, p = noOp, cb) {
    if (typeof cb === 'function') {
      this._listen(h, p, socket => {
        this._sockets[p] = socket;
        cb(socket);
      });
    } else {
      this._listen(h, socket => {
        this._sockets[h] = socket;
        p(socket);
      });
    }
    return this;
  }

  close(port = null) {
    for (let f in this._watched) {
      this._watched[f].close();
    }
    if (port) {
      this._sockets[port] && uWS.us_listen_socket_close(this._sockets[port]);
      delete this._sockets[port];
    } else {
      for (let p in this._sockets) {
        uWS.us_listen_socket_close(this._sockets[p]);
        delete this._sockets[p];
      }
    }
    return this;
  }
}

BaseApp.prototype._staticPaths = {};
BaseApp.prototype._watched = {};
BaseApp.prototype._sockets = {};

module.exports = BaseApp;
