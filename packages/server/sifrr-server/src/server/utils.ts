import { SifrrResponse } from '@/server/response';
import { createWriteStream } from 'fs';
import { HttpResponse } from 'uWebSockets.js';

export function writeHeaders(res: HttpResponse | SifrrResponse, name: string, value: string): void;
export function writeHeaders(
  res: HttpResponse | SifrrResponse,
  headers: { [name: string]: string }
): void;
export function writeHeaders(
  res: HttpResponse | SifrrResponse,
  headers: { [name: string]: string } | string,
  other?: string
) {
  res.cork(() => {
    if (typeof headers === 'string') {
      res.writeHeader(headers, other!.toString());
    } else {
      for (const n in headers) {
        res.writeHeader(n, headers[n]!.toString());
      }
    }
  });
}

export const stob = (fileStream: NodeJS.ReadableStream) =>
  new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    fileStream.on('data', (chunk) => {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk, 'utf-8') : Buffer.from(chunk));
    });
    fileStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    fileStream.on('error', reject);
  });

export const stof = (fileStream: NodeJS.ReadableStream, writeFilePath: string) => {
  const writable = createWriteStream(writeFilePath);
  return new Promise<number>((resolve, reject) => {
    let size = 0;
    fileStream.on('data', (chunk) => {
      const bfr = typeof chunk === 'string' ? Buffer.from(chunk, 'utf-8') : Buffer.from(chunk);
      size += bfr.length;
      writable.write(bfr);
    });
    fileStream.on('end', () => {
      writable.end();
    });
    fileStream.on('error', reject);
    writable.on('finish', () => {
      resolve(size);
    });
    writable.on('error', reject);
  });
};

export const defer = <T>(): {
  promise: Promise<T>;
  resolve: (v: T) => void;
  reject: (reason?: any) => void;
} => {
  let resolve, reject;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {
    promise,
    resolve: resolve!,
    reject: reject!
  };
};
