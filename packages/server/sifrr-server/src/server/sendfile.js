const fs = require('fs');
const ext = require('./ext').getExt;
const bytes = /bytes=/;

function sendFile(res, path, reqHeaders, options) {
  const { mtime, size } = fs.statSync(path);

  // headers
  const responseHeaders = options.headers || {};

  // handling last modified
  if (options.lastModified) {
    // Return 304 if last-modified
    if (reqHeaders['if-modified-since']) {
      if (new Date(reqHeaders['if-modified-since']) >= mtime) {
        res.writeStatus('304 Not Modified');
        return res.end();
      }
    }

    responseHeaders['last-modified'] = mtime.toUTCString();
  }

  responseHeaders['content-type'] = ext(path);

  // write data
  let start = 0, end = size - 1;

  if (reqHeaders.range) {
    const parts = reqHeaders.range.replace(bytes, '').split('-');
    start = parseInt(parts[0], 10);
    end = parts[1] ? parseInt(parts[1], 10) : end;
    responseHeaders['content-range'] = `bytes ${start}-${end}/${size}`;
    responseHeaders['accept-ranges'] = 'bytes';
    res.writeStatus('206 Partial Content');
  }

  const src = fs.createReadStream(path, { start, end });
  res.onAborted(() => src.destroy());
  writeHeaders(res, responseHeaders);
  src.on('data', (buffer) => {
    const chunk = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
      lastOffset = res.getWriteOffset();

    // First try
    const [ok, done] = res.tryEnd(chunk, size);

    if (done) {
      src.destroy();
    } else if (!ok) {
      // pause because backpressure
      src.pause();

      // Save unsent chunk for later
      res.ab = chunk;
      res.abOffset = lastOffset;

      // Register async handlers for drainage
      res.onWritable((offset) => {
        const [ok, done] = res.tryEnd(res.ab.slice(offset - res.abOffset), size);
        if (done) {
          src.destroy();
        } else if (ok) {
          src.resume();
        }
        return ok;
      });
    }
  })
    .on('error', res.close)
    .on('end', () => {
      res.end();
    });
}

function writeHeaders(res, headers) {
  for (let n in headers) {
    res.writeHeader(n, headers[n].toString());
  }
}

module.exports = sendFile;