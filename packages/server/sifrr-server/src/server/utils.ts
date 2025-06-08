import { SifrrResponse } from '@/server/types';

export function writeHeaders(res: SifrrResponse, name: string, value: string): void;
export function writeHeaders(res: SifrrResponse, headers: { [name: string]: string }): void;
export function writeHeaders(
  res: SifrrResponse,
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
