const fs = require('fs');
const errHandler = (err) => { if (err) throw(err); };
const ext = require('./ext').getExt;

function sendFile(res, path, reqHeaders, options) {
  res.onAborted(errHandler);
  fs.stat(path, (err, stat) => {
    if (err) throw err;

    // stats
    const lastModified = stat.mtime, totalSize = stat.size;

    // headers
    const responseHeaders = options.headers || {};

    // handling last modified
    if (options.lastModified) {
      // Return 304 if last-modified is same as request header
      if (reqHeaders['if-modified-since']) {
        if (new Date(reqHeaders['if-modified-since']) <= lastModified) {
          res.writeStatus('304 Not Modified');
          return res.end();
        }
      }

      responseHeaders['last-modified'] = lastModified.toUTCString();
    }

    if (options.contentType) responseHeaders['content-type'] = ext(path);

    // write data
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

    const src = fs.createReadStream(path, { start, end });
    res.onAborted(() => src.destroy());
    writeHeaders(res, responseHeaders);
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
  });
}

function writeHeaders(res, headers) {
  for (let n in headers) {
    res.writeHeader(n, headers[n].toString());
  }
}

module.exports = sendFile;