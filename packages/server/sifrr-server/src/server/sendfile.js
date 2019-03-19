const fs = require('fs');
const zlib = require('zlib');

const compressions = {
  br: zlib.createBrotliCompress,
  gzip: zlib.createGzip,
  deflate: zlib.createDeflate
};
const writeHeaders = require('./utils').writeHeaders;
const ext = require('./ext').getExt;
const bytes = /bytes=/;

function sendFile(res, req, path, { lastModified = true, responseHeaders = {}, compress = true, compressionOptions = {
  priority: [ 'gzip', 'br', 'deflate' ]
} } = {}) {
  const { mtime, size } = fs.statSync(path);
  const reqHeaders = {
    'if-modified-since': req.getHeader('if-modified-since'),
    range: req.getHeader('range'),
    'accept-encoding': req.getHeader('accept-encoding')
  };
  mtime.setMilliseconds(0);

  // handling last modified
  if (lastModified) {
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
    compress = false;
    const parts = reqHeaders.range.replace(bytes, '').split('-');
    start = parseInt(parts[0], 10);
    end = parts[1] ? parseInt(parts[1], 10) : end;
    responseHeaders['content-range'] = `bytes ${start}-${end}/${size}`;
    responseHeaders['accept-ranges'] = 'bytes';
    res.writeStatus('206 Partial Content');
  }

  let readStream = fs.createReadStream(path, { start, end });
  res.onAborted(() => readStream.destroy());
  writeHeaders(res, responseHeaders);

  // Compression;
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
        responseHeaders['content-encoding'] = compressionOptions.priority[i];
        break;
      }
    }
  }

  if (compressed) {
    readStream.on('data', (buffer) => {
      res.write(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
    });
  } else {
    readStream.on('data', (buffer) => {
      const chunk = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
        lastOffset = res.getWriteOffset();

      // First try
      const [ok, done] = res.tryEnd(chunk, size);

      if (done) {
        readStream.destroy();
      } else if (!ok) {
        // pause because backpressure
        readStream.pause();

        // Save unsent chunk for later
        res.ab = chunk;
        res.abOffset = lastOffset;

        // Register async handlers for drainage
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

module.exports = sendFile;