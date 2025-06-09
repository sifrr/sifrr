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
import { Duplex, Writable } from 'stream';
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
) {
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
  // Compression;
  if (compress && compressionOptions.priority?.length) {
    for (const type of compressionOptions.priority) {
      if (reqHeaders['accept-encoding']?.includes(type)) {
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

  const writable = new Writable({
    write(chunk, e, cb) {
      res.cork(() => {
        const ok = res.write(toab(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, e)));
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
}

export default sendFile;
