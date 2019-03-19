const fs = require('fs');
const path = require('path');
const uWS = require('uWebSockets.js');
const sendFile = require('./sendfile');

const noOp = () => true;

class BaseApp {
  file(pattern, path, options) {
    this.get(pattern, (res, req) => {
      sendFile(res, req, path, options);
    });
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
        // serve from this folder
        const url = '/' + path.relative(base, filePath);
        this._staticPaths[prefix + url] = [filePath, options ];
        this.get(prefix + url, this._serveStatic);
      }
    });

    fs.watch(folder, (event, filename) => {
      if (event === 'rename') {
        if (!filename) return;
        const filePath = path.join(folder, filename);
        const url = '/' + path.relative(base, filePath);
        if (fs.existsSync(filePath)) {
          this._staticPaths[prefix + url] = [filePath, options ];
          this.get(prefix + url, this._serveStatic);
        } else {
          delete this._staticPaths[url];
        }
      }
    });
    return this;
  }

  _serveStatic(res, req) {
    const options = this._staticPaths[req.getUrl()];
    if (typeof options === 'undefined') {
      res.writeStatus('404 Not Found');
      res.end();
    } else sendFile(res, req, options[0], options[1]);
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
