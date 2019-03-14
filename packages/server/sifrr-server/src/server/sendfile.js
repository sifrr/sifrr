const fs = require('fs');
const errHandler = (err) => { throw err; };
const ext = require('./ext');
const noOp = () => true;

function sendFile(res, path, reqHeaders, options) {
  res.onAborted(errHandler);

  fs.stat(path, (err, stat) => {
    if (err) return errHandler(err);

    // Return 304 if last-modified is same as request header
    const lastModified = stat.mtime.toUTCString();
    if (reqHeaders['if-modified-since']) {
      if (new Date(reqHeaders['if-modified-since']).toUTCString() === lastModified) {
        res.writeStatus('304 Not Modified');
        return res.end();
      }
    }

    if (options.contentType) res.writeHeader('content-type', ext(path));
    if (options.lastModified) res.writeHeader('last-modified', lastModified);
    res.on = noOp;
    res.once = noOp;
    res.emit = noOp;
    const src = fs.createReadStream(path);
    src.on('error', errHandler);
    src.pipe(res);
  });
}

module.exports = sendFile;