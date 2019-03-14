const delegate = require('./delegate');
const fs = require('fs');
const path = require('path');
const uWS = require('uWebSockets.js');
const sendFile = require('./sendfile');

const requiredHeaders = ['if-modified-since', 'range'];
const noOp = () => true;

class BaseApp {
  file(folder, options = {}, base = folder) {
    options.lastModified = options.lastModified !== false;

    // serve single file
    if (!fs.statSync(folder).isDirectory()) {
      if (!options.urlPath) throw Error('No urlPath was specified in options for file route: ' + folder);
      this._staticPaths[options.urlPath] = { filePath: folder, lm: options.lastModified, headers: options.headers };
      this._app.get(options.urlPath, this._serveStatic.bind(this));
      return this;
    }

    // serve folder
    const filter = options.filter || noOp;
    fs.readdirSync(folder).forEach(file => {
      // Absolute path
      const filePath = path.join(folder, file);

      // Return if filtered
      if (!filter(filePath)) return;

      if (fs.statSync(filePath).isDirectory()) {
        // Recursive if directory
        this.file(filePath, options, base);
      } else {
        // serve from this folder
        const url = '/' + path.relative(base, filePath);
        this._staticPaths[url] = { filePath, lm: options.lastModified, headers: options.headers };
        this._app.get(url, this._serveStatic.bind(this));
      }
    });
    return this;
  }

  _defaultServer() {
    this.__defS = this.__defS || this._serveStatic({ lastModified: true });
    return this.__defS;
  }

  _serveStatic(res, req) {
    const { filePath, lm, headers } = this._staticPaths[req.getUrl()];
    const reqHeaders = {};
    requiredHeaders.forEach(k => reqHeaders[k] = req.getHeader(k));

    sendFile(res, filePath, reqHeaders, lm, headers);
  }

  listen(h, p = noOp, cb) {
    if (typeof cb === 'function') {
      this._app.listen(h, p, (socket) => {
        this._socket = socket;
        cb(socket);
      });
    } else {
      this._app.listen(h, (socket) => {
        this._socket = socket;
        p(socket);
      });
    }
    return this;
  }

  close() {
    if (this._socket) {
      uWS.us_listen_socket_close(this._socket);
      this._socket = null;
    }
  }
}

const methods = [
  'any',
  'connect',
  'del',
  'get',
  'head',
  'options',
  'patch',
  'post',
  'put',
  'trace',
  'ws',
];

delegate(methods, BaseApp.prototype, '_app');
BaseApp.prototype._staticPaths = {};

module.exports = BaseApp;
