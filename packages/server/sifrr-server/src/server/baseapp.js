const delegate = require('./delegate');
const fs = require('fs');
const path = require('path');
const ext = require('./ext');
const errHandler = (err) => { throw err; };
const uWS = require('uWebSockets.js');

class BaseApp {
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
    res.onAborted(errHandler);
    res.writeHeader('content-type', ext(filePath));
    const src = fs.createReadStream(filePath);
    src.on('data', (chunk) => res.write(chunk));
    src.on('end', () => res.end());
    src.on('error', errHandler);
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
