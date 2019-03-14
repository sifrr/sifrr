/*! Sifrr.Server v0.0.3 - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */
import uWebSockets from 'uWebSockets.js';
import fs from 'fs';
import path from 'path';

var delegate = (fxns, proto, delTo) => {
  fxns.forEach(fxn => {
    proto[fxn] = function () {
      this[delTo][fxn](...arguments);
      return this;
    };
  });
};

const DEFAULT_EXT = 'application/octet-stream';
const extensions = {
  '3gp' : 'video/3gpp',
  a     : 'application/octet-stream',
  ai    : 'application/postscript',
  aif   : 'audio/x-aiff',
  aiff  : 'audio/x-aiff',
  asc   : 'application/pgp-signature',
  asf   : 'video/x-ms-asf',
  asm   : 'text/x-asm',
  asx   : 'video/x-ms-asf',
  atom  : 'application/atom+xml',
  au    : 'audio/basic',
  avi   : 'video/x-msvideo',
  bat   : 'application/x-msdownload',
  bin   : 'application/octet-stream',
  bmp   : 'image/bmp',
  bz2   : 'application/x-bzip2',
  c     : 'text/x-c',
  cab   : 'application/vnd.ms-cab-compressed',
  cc    : 'text/x-c',
  chm   : 'application/vnd.ms-htmlhelp',
  class : 'application/octet-stream',
  com   : 'application/x-msdownload',
  conf  : 'text/plain',
  cpp   : 'text/x-c',
  crt   : 'application/x-x509-ca-cert',
  css   : 'text/css',
  csv   : 'text/csv',
  cxx   : 'text/x-c',
  deb   : 'application/x-debian-package',
  der   : 'application/x-x509-ca-cert',
  diff  : 'text/x-diff',
  djv   : 'image/vnd.djvu',
  djvu  : 'image/vnd.djvu',
  dll   : 'application/x-msdownload',
  dmg   : 'application/octet-stream',
  doc   : 'application/msword',
  dot   : 'application/msword',
  dtd   : 'application/xml-dtd',
  dvi   : 'application/x-dvi',
  ear   : 'application/java-archive',
  eml   : 'message/rfc822',
  eps   : 'application/postscript',
  exe   : 'application/x-msdownload',
  f     : 'text/x-fortran',
  f77   : 'text/x-fortran',
  f90   : 'text/x-fortran',
  flv   : 'video/x-flv',
  for   : 'text/x-fortran',
  gem   : 'application/octet-stream',
  gemspec: 'text/x-script.ruby',
  gif   : 'image/gif',
  gz    : 'application/x-gzip',
  h     : 'text/x-c',
  hh    : 'text/x-c',
  htm   : 'text/html',
  html  : 'text/html',
  ico   : 'image/vnd.microsoft.icon',
  ics   : 'text/calendar',
  ifb   : 'text/calendar',
  iso   : 'application/octet-stream',
  jar   : 'application/java-archive',
  java  : 'text/x-java-source',
  jnlp  : 'application/x-java-jnlp-file',
  jpeg  : 'image/jpeg',
  jpg   : 'image/jpeg',
  js    : 'application/javascript',
  json  : 'application/json',
  log   : 'text/plain',
  m3u   : 'audio/x-mpegurl',
  m4v   : 'video/mp4',
  man   : 'text/troff',
  mathml: 'application/mathml+xml',
  mbox  : 'application/mbox',
  mdoc  : 'text/troff',
  me    : 'text/troff',
  mid   : 'audio/midi',
  midi  : 'audio/midi',
  mime  : 'message/rfc822',
  mml   : 'application/mathml+xml',
  mng   : 'video/x-mng',
  mov   : 'video/quicktime',
  mp3   : 'audio/mpeg',
  mp4   : 'video/mp4',
  mp4v  : 'video/mp4',
  mpeg  : 'video/mpeg',
  mpg   : 'video/mpeg',
  ms    : 'text/troff',
  msi   : 'application/x-msdownload',
  odp   : 'application/vnd.oasis.opendocument.presentation',
  ods   : 'application/vnd.oasis.opendocument.spreadsheet',
  odt   : 'application/vnd.oasis.opendocument.text',
  ogg   : 'application/ogg',
  p     : 'text/x-pascal',
  pas   : 'text/x-pascal',
  pbm   : 'image/x-portable-bitmap',
  pdf   : 'application/pdf',
  pem   : 'application/x-x509-ca-cert',
  pgm   : 'image/x-portable-graymap',
  pgp   : 'application/pgp-encrypted',
  pkg   : 'application/octet-stream',
  pl    : 'text/x-script.perl',
  pm    : 'text/x-script.perl-module',
  png   : 'image/png',
  pnm   : 'image/x-portable-anymap',
  ppm   : 'image/x-portable-pixmap',
  pps   : 'application/vnd.ms-powerpoint',
  ppt   : 'application/vnd.ms-powerpoint',
  ps    : 'application/postscript',
  psd   : 'image/vnd.adobe.photoshop',
  py    : 'text/x-script.python',
  qt    : 'video/quicktime',
  ra    : 'audio/x-pn-realaudio',
  rake  : 'text/x-script.ruby',
  ram   : 'audio/x-pn-realaudio',
  rar   : 'application/x-rar-compressed',
  rb    : 'text/x-script.ruby',
  rdf   : 'application/rdf+xml',
  roff  : 'text/troff',
  rpm   : 'application/x-redhat-package-manager',
  rss   : 'application/rss+xml',
  rtf   : 'application/rtf',
  ru    : 'text/x-script.ruby',
  s     : 'text/x-asm',
  sgm   : 'text/sgml',
  sgml  : 'text/sgml',
  sh    : 'application/x-sh',
  sig   : 'application/pgp-signature',
  snd   : 'audio/basic',
  so    : 'application/octet-stream',
  svg   : 'image/svg+xml',
  svgz  : 'image/svg+xml',
  swf   : 'application/x-shockwave-flash',
  t     : 'text/troff',
  tar   : 'application/x-tar',
  tbz   : 'application/x-bzip-compressed-tar',
  tcl   : 'application/x-tcl',
  tex   : 'application/x-tex',
  texi  : 'application/x-texinfo',
  texinfo: 'application/x-texinfo',
  text  : 'text/plain',
  tif   : 'image/tiff',
  tiff  : 'image/tiff',
  torrent: 'application/x-bittorrent',
  tr    : 'text/troff',
  txt   : 'text/plain',
  vcf   : 'text/x-vcard',
  vcs   : 'text/x-vcalendar',
  vrml  : 'model/vrml',
  war   : 'application/java-archive',
  wav   : 'audio/x-wav',
  wma   : 'audio/x-ms-wma',
  wmv   : 'video/x-ms-wmv',
  wmx   : 'video/x-ms-wmx',
  wrl   : 'model/vrml',
  wsdl  : 'application/wsdl+xml',
  xbm   : 'image/x-xbitmap',
  xhtml : 'application/xhtml+xml',
  xls   : 'application/vnd.ms-excel',
  xml   : 'application/xml',
  xpm   : 'image/x-xpixmap',
  xsl   : 'application/xml',
  xslt  : 'application/xslt+xml',
  yaml  : 'text/yaml',
  yml   : 'text/yaml',
  zip   : 'application/zip'
};
var ext = {
  getExt: (path) => {
    const i = path.lastIndexOf('.');
    return extensions[path.substr(i + 1).toLowerCase()] || DEFAULT_EXT;
  },
  extensions
};

const errHandler = (err) => { if (err) throw(err); };
const ext$1 = ext.getExt;
function sendFile(res, path, reqHeaders, options) {
  res.onAborted(errHandler);
  fs.stat(path, (err, stat) => {
    if (err) throw err;
    const lastModified = stat.mtime.toUTCString(), totalSize = stat.size;
    const responseHeaders = options.headers || {};
    if (options.contentType) responseHeaders['content-type'] = ext$1(path);
    if (options.lastModified) responseHeaders['last-modified'] = lastModified;
    if (reqHeaders['if-modified-since']) {
      if (new Date(reqHeaders['if-modified-since']).toUTCString() === lastModified) {
        writeHeaders(res, responseHeaders);
        res.writeStatus('304 Not Modified');
        return res.end();
      }
    }
    let start = 0, end = totalSize - 1;
    if (reqHeaders.range) {
      const parts = reqHeaders.range.replace(/bytes=/, '').split('-');
      start = parseInt(parts[0], 10);
      end = parts[1]
        ? parseInt(parts[1], 10)
        : totalSize - 1;
      Object.assign(responseHeaders, {
        'content-range': `bytes ${start}-${end}/${totalSize}`,
        'accept-ranges': 'bytes'
      });
      res.writeStatus('206 Partial Content');
    }
    writeHeaders(res, responseHeaders);
    const src = fs.createReadStream(path, { start, end });
    res.onAborted(() => src.destroy());
    src.on('data', (buffer) => {
      const chunk = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
      const lastOffset = res.getWriteOffset();
      const [ok, done] = res.tryEnd(chunk, totalSize);
      if (done) {
        src.destroy();
      } else if (!ok) {
        src.pause();
        res.ab = chunk;
        res.abOffset = lastOffset;
        res.onWritable((offset) => {
          const [ok, done] = res.tryEnd(res.ab.slice(offset - res.abOffset), totalSize);
          if (done) {
            src.destroy();
          } else if (ok) {
            src.resume();
          }
          return ok;
        });
      }
    }).on('error', res.close);
    src.on('end', () => {
      res.end();
    });
  });
}
function writeHeaders(res, headers) {
  for (let n in headers) {
    res.writeHeader(n, headers[n].toString());
  }
}
var sendfile = sendFile;

const requiredHeaders = ['if-modified-since', 'range'];
const noOp = () => true;
class BaseApp {
  file(servingPattern, folder, options = {}, base = folder) {
    if (servingPattern === '/') servingPattern = '';
    options = Object.assign({
      lastModified: true,
      contentType: true
    }, options);
    const filter = options.filter || noOp;
    if (!fs.statSync(folder).isDirectory()) {
      const fileName = path.basename(folder);
      const folderName = path.dirname(folder);
      this._app.get(servingPattern + '/' + fileName, this._serveFromFolder(folderName, options));
      return this;
    }
    fs.readdirSync(folder).forEach(file => {
      const filePath = path.join(folder, file);
      if (!filter(filePath)) return;
      const serveFromThisFolder = this._serveFromFolder(folder, options);
      if (fs.statSync(filePath).isDirectory()) {
        this.file(servingPattern, filePath, options, base);
      } else {
        this._app.get(servingPattern + '/' + path.relative(base, filePath), serveFromThisFolder);
      }
    });
    return this;
  }
  _serveFromFolder(folder, options) {
    return (res, req) => {
      const filePath = path.join(folder, req.getUrl().substr(1));
      const reqHeaders = {};
      requiredHeaders.forEach(k => reqHeaders[k] = req.getHeader(k));
      sendfile(res, filePath, reqHeaders, options);
    };
  }
  listen(h, p, cb) {
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
  }
  close() {
    if (this._socket) {
      uWebSockets.us_listen_socket_close(this._socket);
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
var baseapp = BaseApp;

class App extends baseapp {
  constructor(options) {
    super(options);
    this._app = uWebSockets.App(options);
  }
}
var app = App;

class SSLApp extends baseapp {
  constructor(options) {
    super(options);
    this._app = uWebSockets.SSLApp(options);
  }
}
var sslapp = SSLApp;

var sifrr_server = {
  App: app,
  SSLApp: sslapp,
  extensions: ext.extensions,
  getExtension: ext.getExt
};
var sifrr_server_1 = sifrr_server.App;
var sifrr_server_2 = sifrr_server.SSLApp;
var sifrr_server_3 = sifrr_server.extensions;
var sifrr_server_4 = sifrr_server.getExtension;

export default sifrr_server;
export { sifrr_server_1 as App, sifrr_server_2 as SSLApp, sifrr_server_3 as extensions, sifrr_server_4 as getExtension };
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.server.module.js.map
