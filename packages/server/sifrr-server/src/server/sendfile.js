const fs = require('fs');
const errHandler = (err) => { throw err; };
const ext = require('./ext');

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

module.exports = sendFile;