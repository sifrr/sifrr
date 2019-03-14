const fs = require('fs');
const errHandler = (err) => { if (err) throw(err); };
const ext = require('./ext').getExt;

function sendFile(res, path, reqHeaders, options) {
  res.onAborted(errHandler);
  fs.stat(path, (err, stat) => {
    if (err) throw err;

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

    // write data
    const src = fs.createReadStream(path);
    const totalSize = stat.size;

    src.on('data', (buffer) => {
      const chunk = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
      const lastOffset = res.getWriteOffset();

      // First try
      const [ok, done] = res.tryEnd(chunk, totalSize);

      if (done) {
        src.destroy();
      } else if (!ok) {
        // If we could not send this chunk, pause
        src.pause();

        // Save unsent chunk for when we can send it
        res.ab = chunk;
        res.abOffset = lastOffset;

        // Register async handlers for drainage
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
    res.onAborted(() => src.destroy());
  });
}

module.exports = sendFile;