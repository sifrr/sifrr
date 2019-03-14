const delegate = require('./delegate');
const fs = require('fs');
const path = require('path');
const uWS = require('uWebSockets.js');
const sendFile = require('./sendfile');

class BaseApp {
  constructor(options = {}) {
    this._origins = options.allowedOrigins;
    this._methods = options.allowedMethods;
  }

  file(folder, base = folder) {
    fs.readdirSync(folder).forEach(file => {
      const filePath = path.join(folder, file);
      if (fs.statSync(filePath).isDirectory()) {
        this.file(filePath, base);
      } else {
        this._app.get('/' + path.relative(base, filePath), (res, req) => {
          this._getFile(res, req, filePath);
        });
      }
    });
    return this;
  }

  _getFile(res, req, filePath) {
    const headers = {};
    req.forEach((k ,v) => headers[k] = v);
    if (this._origins) res.writeHeader('access-control-allow-origin', this._origins.join(','));
    if (this._methods) res.writeHeader('access-control-allow-methods', this._methods.join(','));
    sendFile(res, filePath, headers);
  }

  listen(p, cb) {
    this._app.listen(p, (socket) => {
      this._socket = socket;
      cb(socket);
    });
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
  'listen',
  'options',
  'patch',
  'post',
  'put',
  'trace',
  'ws',
];

delegate(methods, BaseApp.prototype, '_app');

module.exports = BaseApp;
