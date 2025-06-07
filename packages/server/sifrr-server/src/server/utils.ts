import { SifrrResponse } from '@/server/types';

export function writeHeaders(res: SifrrResponse, name: string, value: string): void;
export function writeHeaders(res: SifrrResponse, headers: { [name: string]: string }): void;
export function writeHeaders(
  res: SifrrResponse,
  headers: { [name: string]: string } | string,
  other?: string
) {
  if (typeof headers === 'string') {
    res.writeHeader(headers, other!.toString());
  } else {
    for (const n in headers) {
      res.writeHeader(n, headers[n]!.toString());
    }
  }
}
