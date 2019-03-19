const fs = require('fs');
const path = require('path');
const uWS = require('uWebSockets.js');
const sendFile = require('./sendfile');

const noOp = () => true;

class BaseApp {
  file(folder, options = {}, base = folder) {
    options.lastModified = options.lastModified !== false;

    // serve single file
    if (!fs.statSync(folder).isDirectory()) {
      if (!options.urlPath) throw Error('No urlPath was specified in options for file route: ' + folder);
      this._staticPaths[options.urlPath] = { filePath: folder, lm: options.lastModified, headers: options.headers };
      this.get(options.urlPath, this._serveStatic);
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
        options.responseHeaders = options.headers;
        this._staticPaths[url] = [filePath, options ];
        this.get(url, this._serveStatic);
      }
    });
    return this;
  }

  _serveStatic(res, req) {
    const options = this._staticPaths[req.getUrl()];

    sendFile(res, req, options[0], options[1]);
  }

  listen(h, p = noOp, cb) {
    if (typeof cb === 'function') {
      this._listen(h, p, (socket) => {
        this._socket = socket;
        cb(socket);
      });
    } else {
      this._listen(h, (socket) => {
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

module.exports = BaseApp;
