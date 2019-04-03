const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const uWS = require('uWebSockets.js');

const sendFile = require('./sendfile');
const formData = require('./formdata');
const loadroutes = require('./loadroutes');

const contTypes = ['application/x-www-form-urlencoded', 'multipart/form-data'];
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

    if (options && options.watch) {
      if (this._watched.indexOf(folder) < 0) {
        fs.watch(folder, (event, filename) => {
          if (event === 'rename') {
            if (!filename) return;
            const filePath = path.join(folder, filename);
            const url = '/' + path.relative(base, filePath);
            if (fs.existsSync(filePath) && filter(filePath)) {
              this._staticPaths[prefix + url] = [filePath, options];
              this.get(prefix + url, this._serveStatic);
            } else {
              delete this._staticPaths[prefix + url];
            }
          }
        });
        this._watched.push(folder);
      }
    }
    return this;
  }

  _serveStatic(res, req) {
    const options = this._staticPaths[req.getUrl()];
    if (typeof options === 'undefined') {
      res.writeStatus('404 Not Found');
      res.end();
    } else sendFile(res, req, options[0], options[1]);
  }

  post(pattern, handler) {
    if (typeof handler !== 'function') throw Error(`handler should be a function, given ${typeof handler}.`);
    this._post(pattern, (res, req) => {
      const contType = req.getHeader('content-type');

      res.bodyStream = function() {
        const stream = new Readable();
        stream._read = noOp;

        this.onData((ab, isLast) => {
          // uint and then slicing is bit faster than slice and then uint
          stream.push(new Uint8Array(ab, ab.byteOffset, ab.byteLength).slice(0, ab.byteLength));
          if (isLast) {
            stream.push(null);
          }
        });

        return stream;
      };

      res.body = function() {
        return new Promise(resolve => {
          const buffers = [];
          const stream = this.bodyStream();
          stream.on('data', buffers.push.bind(buffers));

          stream.on('end', () => {
            switch (buffers.length) {
            case 0:
              resolve(Buffer.allocUnsafe(0));
              break;
            case 1:
              resolve(buffers[0]);
              break;
            default:
              resolve(Buffer.concat(buffers));
            }
          });
        });
      };

      if (contType.indexOf('application/json') > -1) res.json = async () => JSON.parse(await res.body());
      if (contTypes.map(t => contType.indexOf(t) > -1).indexOf(true) > -1) res.formData = formData.bind(res, contType);

      handler(res, req);
    });
    return this;
  }

  load(dir, options) {
    loadroutes.call(this, dir, options);
    return this;
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

BaseApp.prototype._staticPaths = {};
BaseApp.prototype._watched = [];

module.exports = BaseApp;
