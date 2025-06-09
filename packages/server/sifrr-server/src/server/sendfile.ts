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
import { toab, writeHeaders } from '@/server/utils';
import { Duplex, Readable, Writable } from 'stream';
import { HttpResponse } from 'uWebSockets.js';
import { SifrrResponse } from '@/server/response';

export const sendFile = (
  path: string,
  options: SendFileOptions,
  req: SifrrRequest,
  res: SifrrResponse
) => {
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
};

export const sendFileToRes = (
  givenRes: HttpResponse | SifrrResponse,
  reqHeaders: { [name: string]: string },
  path: string,
  {
    lastModified = true,
    headers = {},
    compress = false,
    compressionOptions = {
      priority: ['br', 'gzip', 'deflate']
    }
  }: SendFileOptions = {}
) => {
  const res: HttpResponse = givenRes._res ?? givenRes;
  let mtime: Date, size: number;
  try {
    const stat = statSync(path);
    mtime = stat.mtime;
    size = stat.size;
  } catch (e) {
    console.error(e);
    return res.writeStatus('404').end();
  }
  headers = { ...headers };
  // handling last modified
  if (lastModified) {
    mtime.setMilliseconds(0);
    const mtimeutc = mtime.toUTCString();
    // Return 304 if last-modified
    if (reqHeaders['if-modified-since']) {
      if (new Date(reqHeaders['if-modified-since']) >= mtime) {
        return res.writeStatus('304 Not Modified').end();
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
  let compressed = false;
  // Compression;
  if (compress && compressionOptions.priority?.length) {
    for (const type of compressionOptions.priority) {
      if (reqHeaders['accept-encoding']?.includes(type)) {
        const compressor = compressions[type](compressionOptions);
        readStream.pipe(compressor);
        readStream = compressor;
        headers['content-encoding'] = type;
        compressed = true;
        break;
      }
    }
  }

  writeHeaders(res, headers);

  sendStreamToRes(res, readStream, compressed ? undefined : size);
};

export const sendStreamToRes = (
  origRes: HttpResponse | SifrrResponse,
  readStream: Readable,
  size?: number
) => {
  const res = origRes._res ?? origRes;
  res.onAborted(() => readStream.destroy());
  const writable = new Writable({
    write(chunk, e, cb) {
      const bfr = toab(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, e));
      res.cork(() => {
        let ok = true;
        if (!size) {
          ok = res.write(bfr);
        } else {
          const ret = res.tryEnd(bfr, size);
          ok = ret[0];
          if (ret[1]) {
            readStream.destroy();
            return cb();
          }
        }
        if (!ok) {
          readStream.pause();
          res.onWritable(() => {
            readStream.resume();
            return true;
          });
        }
        cb();
      });
    }
  });
  readStream
    .on('error', (e: Error) => {
      console.error(e);
      res.writeStatus('500 Internal server error');
      readStream.destroy();
      res.cork(() => {
        res.end();
      });
    })
    .on('end', () => {
      res.cork(() => {
        res.end();
      });
    })
    .pipe(writable);
};
