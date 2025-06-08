import { statSync, createReadStream, ReadStream } from 'fs';
import { createBrotliCompress, createGzip, createDeflate } from 'zlib';

const compressions = {
  br: createBrotliCompress,
  gzip: createGzip,
  deflate: createDeflate
};
import { getMimetype } from './mime';
const bytes = 'bytes=';
import { SendFileOptions, SifrrRequest } from './types';
import { writeHeaders } from '@/server/utils';
import { Duplex } from 'stream';
import { HttpRequest, HttpResponse } from 'uWebSockets.js';
import { SifrrResponse } from '@/server/response';

function sendFile(
  path: string,
  options: SendFileOptions,
  req: HttpRequest | SifrrRequest,
  res: HttpResponse | SifrrResponse
) {
  sendFileToRes(
    res,
    {
      'if-modified-since': req.getHeader('if-modified-since'),
      range: req.getHeader('range'),
      'accept-encoding': req.getHeader('accept-encoding')
    },
    path,
    options
  );
}

function sendFileToRes(
  res: HttpResponse | SifrrResponse,
  reqHeaders: { [name: string]: string },
  path: string,
  {
    lastModified = true,
    headers = {},
    compress = false,
    compressionOptions = {
      priority: ['gzip', 'br', 'deflate']
    }
  }: SendFileOptions = {}
) {
  let { mtime, size } = statSync(path);
  headers = { ...headers };
  // handling last modified
  if (lastModified) {
    mtime.setMilliseconds(0);
    const mtimeutc = mtime.toUTCString();
    // Return 304 if last-modified
    if (reqHeaders['if-modified-since']) {
      if (new Date(reqHeaders['if-modified-since']) >= mtime) {
        res.writeStatus('304 Not Modified');
        return res.end();
      }
    }
    headers['last-modified'] = mtimeutc;
  }
  const mime = getMimetype(path);
  if (mime) {
    headers['content-type'] = mime;
  }

  // write data
  let start = 0,
    end = size - 1;

  if (reqHeaders.range) {
    compress = false;
    const parts = reqHeaders.range.replace(bytes, '').split('-');
    start = parseInt(parts[0]!, 10);
    end = parts[1] ? parseInt(parts[1], 10) : end;
    headers['accept-ranges'] = 'bytes';
    headers['content-range'] = `bytes ${start}-${end}/${size}`;
    size = end - start + 1;
    res.writeStatus('206 Partial Content');
  }

  // for size = 0
  if (end < 0) end = 0;

  let readStream: ReadStream | Duplex = createReadStream(path, { start, end });
  // Compression;
  let compressed: boolean | string = false;
  if (compress && compressionOptions.priority?.length) {
    for (const type of compressionOptions.priority) {
      if (reqHeaders['accept-encoding'] && reqHeaders['accept-encoding']?.indexOf(type) > -1) {
        compressed = type!;
        const compressor = compressions[type](compressionOptions);
        readStream.pipe(compressor);
        readStream = compressor;
        headers['content-encoding'] = type;
        break;
      }
    }
  }

  res.onAborted(() => readStream.destroy());
  writeHeaders(res, headers);
  if (compressed) {
    readStream.on('data', (buffer: Buffer) => {
      res.write(
        buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
      );
    });
  } else {
    readStream.on('data', (buffer: Buffer) => {
      const chunk = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
        lastOffset = res.getWriteOffset();

      // First try
      const [ok, done] = res.tryEnd(chunk as ArrayBuffer, size);

      if (done) {
        readStream.destroy();
      } else if (!ok) {
        // pause because backpressure
        readStream.pause();

        // Save unsent chunk for later
        res.ab = chunk;
        res.abOffset = lastOffset;

        // Register async handlers for drainage
        res.onWritable((offset: number) => {
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
    .on('error', (e: Error) => {
      res.writeStatus('500 Internal server error');
      readStream.destroy();
      console.error(e);
      res.end();
    })
    .on('end', () => {
      res.end();
    });
}

export default sendFile;
