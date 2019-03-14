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
const extTypes = {
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
var ext = (path) => {
  const i = path.lastIndexOf('.');
  return extTypes[path.substr(i + 1).toLowerCase()] || DEFAULT_EXT;
};

const errHandler = (err) => { throw err; };
function sendFile(res, path, headers) {
  res.onAborted(errHandler);
  res.writeHeader('content-type', ext(path));
  const src = fs.createReadStream(path);
  fs.stat(path, function onstat (err, stat) {
    if (err) return errHandler(err);
    if (headers['if-modified-since']) {
      const ims = new Date(headers['if-modified-since']);
      stat.mtime.setMilliseconds(0);
      if (ims.toString() === stat.mtime.toString()) {
        res.writeStatus('304 Not Modified');
        return res.end();
      }
    }
    res.writeHeader('last-modified', stat.mtime.toString());
    src.on('data', (chunk) => res.write(chunk));
    src.on('end', () => res.end());
    src.on('error', errHandler);
  });
}
var sendfile = sendFile;

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
    sendfile(res, filePath, headers);
  }
  listen(p, cb) {
    this._app.listen(p, (socket) => {
      this._socket = socket;
      cb(socket);
    });
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
  SSLApp: sslapp
};
var sifrr_server_1 = sifrr_server.App;
var sifrr_server_2 = sifrr_server.SSLApp;

export default sifrr_server;
export { sifrr_server_1 as App, sifrr_server_2 as SSLApp };
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.server.module.js.map
