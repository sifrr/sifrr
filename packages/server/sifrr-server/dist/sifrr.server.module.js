/*! Sifrr.Server v0.0.4 - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */
import uWebSockets from 'uWebSockets.js';
import fs from 'fs';
import path$1 from 'path';
import stream from 'stream';
import zlib from 'zlib';
import busboy from 'busboy';
import mkdirp from 'mkdirp';

function writeHeaders(res, headers, other) {
  if (typeof other !== 'undefined') {
    res.writeHeader(headers, other.toString());
  } else {
    for (let n in headers) {
      res.writeHeader(n, headers[n].toString());
    }
  }
}
function clone(obj) {
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) return obj.slice(0);
    if (obj === null) return null;
    return Object.assign({}, obj);
  } else {
    return obj;
  }
}
function extend(who, from, overwrite = true) {
  const ownProps = Object.getOwnPropertyNames(from.prototype);
  ownProps.forEach(prop => {
    if (prop === 'constructor') return;
    if (who[prop] && overwrite) {
      who[`_${prop}`] = who[prop];
    }
    if (typeof from.prototype[prop] === 'function') who[prop] = from.prototype[prop].bind(who);
    else who[prop] = clone(from.prototype[prop]);
  });
}
var utils = {
  writeHeaders,
  extend
};

const mimes = {
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
  mjs   : 'application/javascript',
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
  zip   : 'application/zip',
  default: 'text/html'
};
var mime = {
  getMime: (path) => {
    const i = path.lastIndexOf('.');
    return mimes[path.substr(i + 1).toLowerCase()] || mimes['default'];
  },
  mimes
};

const compressions = {
  br: zlib.createBrotliCompress,
  gzip: zlib.createGzip,
  deflate: zlib.createDeflate
};
const { writeHeaders: writeHeaders$1 } = utils;
const getMime = mime.getMime;
const bytes = 'bytes=';
function sendFile(res, req, path, options) {
  const reqHeaders = {
    'if-modified-since': req.getHeader('if-modified-since'),
    range: req.getHeader('range'),
    'accept-encoding': req.getHeader('accept-encoding')
  };
  sendFileToRes(res, reqHeaders, path, options);
}
function sendFileToRes(res, reqHeaders, path, {
  lastModified = true,
  headers = {},
  compress = false,
  compressionOptions = {
    priority: [ 'gzip', 'br', 'deflate' ]
  },
  cache = false
} = {}) {
  let { mtime, size } = fs.statSync(path);
  mtime.setMilliseconds(0);
  const mtimeutc = mtime.toUTCString();
  if (lastModified) {
    if (reqHeaders['if-modified-since']) {
      if (new Date(reqHeaders['if-modified-since']) >= mtime) {
        res.writeStatus('304 Not Modified');
        return res.end();
      }
    }
    headers['last-modified'] = mtimeutc;
  }
  headers['content-type'] = getMime(path);
  if (cache) {
    res.onAborted(() => {});
    return cache.wrap(`${path}_${mtimeutc}`, (cb) => {
      fs.readFile(path, cb);
    }, { ttl: 0 }, (err, string) => {
      if (err) {
        res.writeStatus('500 Internal server error');
        res.end();
        throw err;
      }
      writeHeaders$1(res, headers);
      res.end(string);
    });
  }
  let start = 0, end = size - 1;
  if (reqHeaders.range) {
    compress = false;
    const parts = reqHeaders.range.replace(bytes, '').split('-');
    start = parseInt(parts[0], 10);
    end = parts[1] ? parseInt(parts[1], 10) : end;
    headers['accept-ranges'] = 'bytes';
    headers['content-range'] = `bytes ${start}-${end}/${size}`;
    size = end - start + 1;
    res.writeStatus('206 Partial Content');
  }
  if (end < 0) end = 0;
  let readStream = fs.createReadStream(path, { start, end });
  let compressed = false;
  if (compress) {
    const l = compressionOptions.priority.length;
    for (let i = 0; i < l; i++) {
      const type = compressionOptions.priority[i];
      if (reqHeaders['accept-encoding'].indexOf(type) > -1) {
        compressed = true;
        const compressor = compressions[type](compressionOptions);
        readStream.pipe(compressor);
        readStream = compressor;
        headers['content-encoding'] = compressionOptions.priority[i];
        break;
      }
    }
  }
  res.onAborted(() => readStream.destroy());
  writeHeaders$1(res, headers);
  if (compressed) {
    readStream.on('data', (buffer) => {
      readStream.pause();
      res.write(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
      readStream.resume();
    });
  } else {
    readStream.on('data', (buffer) => {
      const chunk = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
        lastOffset = res.getWriteOffset();
      const [ok, done] = res.tryEnd(chunk, size);
      if (done) {
        readStream.destroy();
      } else if (!ok) {
        readStream.pause();
        res.ab = chunk;
        res.abOffset = lastOffset;
        res.onWritable((offset) => {
          const [ok, done] = res.tryEnd(res.ab.slice(offset - res.abOffset), size);
          if (done) {
            readStream.destroy();
          } else if (ok) {
            readStream.resume();
          }
          return ok;
        });
      }
    });
  }
  readStream
    .on('error', res.close)
    .on('end', () => {
      res.end();
    });
}
var sendfile = sendFile;

var formdata = function(contType, options = {}) {
  options.headers = {
    'content-type': contType
  };
  return new Promise((resolve, reject) => {
    const busb = new busboy(options);
    const ret = {};
    this.bodyStream().pipe(busb);
    busb.on('limit', () => {
      if (options.abortOnLimit) {
        reject('limit');
      }
    });
    busb.on('file', function(fieldname, file, filename, encoding, mimetype) {
      const value = {
        filename,
        encoding,
        mimetype
      };
      if (typeof options.tmpDir === 'string') {
        const fileToSave = path.join(options.tmpDir, filename);
        mkdirp(path.dirname(fileToSave));
        file.pipe(fs.createWriteStream(fileToSave));
        value.filePath = fileToSave;
      } else options.onFile(fieldname, file, filename, encoding, mimetype);
      setRetValue(ret, fieldname, value);
    });
    busb.on('field', function(fieldname, value) {
      if (typeof options.onField === 'function') options.onField(fieldname, value);
      setRetValue(ret, fieldname, value);
    });
    busb.on('finish', function() {
      resolve(ret);
    });
    busb.on('error', reject);
  });
};
function setRetValue(ret, fieldname, value) {
  if (fieldname.slice(-2) === '[]') {
    fieldname = fieldname.slice(0, fieldname.length - 2);
    if (Array.isArray(ret[fieldname])) {
      ret[fieldname].push(value);
    } else {
      ret[fieldname] = [value];
    }
  } else {
    if (Array.isArray(ret[fieldname])) {
      ret[fieldname].push(value);
    } else if (ret[fieldname]) {
      ret[fieldname] = [ret[fieldname], value];
    }  else {
      ret[fieldname] = value;
    }
  }
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}

function loadRoutes(dir, { filter = () => true, basePath = '' } = {}) {
  let files;
  const paths = [];
  if (fs.statSync(dir).isDirectory()) {
    files = fs
      .readdirSync(dir)
      .filter(filter).map(file => path$1.join(dir, file));
  } else {
    files = [dir];
  }
  files.forEach((file) => {
    if (fs.statSync(file).isDirectory()) {
      paths.push(...loadRoutes.call(this, file, { filter, basePath }));
    } else if (path$1.extname(file) === '.js') {
      const routes = commonjsRequire(file);
      let basePaths = routes.basePath || [''];
      delete routes.basePath;
      if (typeof basePaths === 'string') basePaths = [basePaths];
      basePaths.forEach((basep) => {
        for (const method in routes) {
          const methodRoutes = routes[method];
          for (let r in methodRoutes) {
            if (!Array.isArray(methodRoutes[r])) methodRoutes[r] = [methodRoutes[r]];
            this[method](basePath + basep + r, ...methodRoutes[r]);
            paths.push(basePath + basep + r);
          }
        }
      });
    }
  });
  return paths;
}
var loadroutes = loadRoutes;

function stob(stream) {
  return new Promise(resolve => {
    const buffers = [];
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
}
var streamtobuffer = stob;

const { Readable } = stream;
const contTypes = ['application/x-www-form-urlencoded', 'multipart/form-data'];
const noOp = () => true;
class BaseApp {
  file(pattern, path, options) {
    this.get(pattern, (res, req) => {
      sendfile(res, req, path, options);
    });
    return this;
  }
  folder(prefix, folder, options, base = folder) {
    if (!fs.statSync(folder).isDirectory()) {
      throw Error('Given path is not a directory: ' + folder);
    }
    if (prefix[0] !== '/') prefix = '/' + prefix;
    if (prefix[prefix.length - 1] === '/') prefix = prefix.slice(0, -1);
    const filter = options ? options.filter || noOp : noOp;
    fs.readdirSync(folder).forEach(file => {
      const filePath = path$1.join(folder, file);
      if (!filter(filePath)) return;
      if (fs.statSync(filePath).isDirectory()) {
        this.folder(prefix, filePath, options, base);
      } else {
        const url = '/' + path$1.relative(base, filePath);
        if (this._staticPaths[prefix + url]) return;
        this._staticPaths[prefix + url] = [filePath, options ];
        this.get(prefix + url, this._serveStatic);
      }
    });
    if (options && options.watch) {
      if (this._watched.indexOf(folder) < 0) {
        fs.watch(folder, (event, filename) => {
          if (event === 'rename') {
            if (!filename) return;
            const filePath = path$1.join(folder, filename);
            const url = '/' + path$1.relative(base, filePath);
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
    } else sendfile(res, req, options[0], options[1]);
  }
  post(pattern, handler) {
    if (typeof handler !== 'function') throw Error(`handler should be a function, given ${typeof handler}.`);
    this._post(pattern, (res, req) => {
      const contType = req.getHeader('content-type');
      res.bodyStream = function() {
        const stream = new Readable();
        stream._read = noOp;
        this.onData((ab, isLast) => {
          stream.push(new Uint8Array(ab.slice(ab.byteOffset, ab.byteLength)));
          if (isLast) {
            stream.push(null);
          }
        });
        return stream;
      };
      res.body = () => streamtobuffer(res.bodyStream());
      if (contType.indexOf('application/json') > -1) res.json = async () => JSON.parse(await res.body());
      if (contTypes.map(t => contType.indexOf(t) > -1).indexOf(true) > -1) res.formData = formdata.bind(res, contType);
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
      uWebSockets.us_listen_socket_close(this._socket);
      this._socket = null;
    }
  }
}
BaseApp.prototype._staticPaths = {};
BaseApp.prototype._watched = [];
var baseapp = BaseApp;

const { extend: extend$1 } = utils;
class App extends uWebSockets.App {
  constructor(options = {}) {
    super(options);
    extend$1(this, baseapp);
  }
}
var app = App;

const { extend: extend$2 } = utils;
class SSLApp extends uWebSockets.SSLApp {
  constructor(options) {
    super(options);
    extend$2(this, baseapp);
  }
}
var sslapp = SSLApp;

var sifrr_server = {
  App: app,
  SSLApp: sslapp,
  mimes: mime.mimes,
  getMime: mime.getMime,
  writeHeaders: utils.writeHeaders,
  sendFile: sendfile
};
var sifrr_server_1 = sifrr_server.App;
var sifrr_server_2 = sifrr_server.SSLApp;
var sifrr_server_3 = sifrr_server.mimes;
var sifrr_server_4 = sifrr_server.getMime;
var sifrr_server_5 = sifrr_server.writeHeaders;
var sifrr_server_6 = sifrr_server.sendFile;

export default sifrr_server;
export { sifrr_server_1 as App, sifrr_server_2 as SSLApp, sifrr_server_4 as getMime, sifrr_server_3 as mimes, sifrr_server_6 as sendFile, sifrr_server_5 as writeHeaders };
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.server.module.js.map
