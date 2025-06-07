import { SifrrServer } from '@/server/baseapp';
import { ParsedQuery, ParseOptions } from 'query-string';
import { Readable } from 'stream';
import { AppOptions, WebSocketBehavior, HttpResponse, HttpRequest } from 'uWebSockets.js';
import { ZlibOptions, BrotliOptions } from 'zlib';

export type SifrrServerOptions = AppOptions & {
  ssl?: boolean;
};

export interface SifrrRequest extends Omit<HttpRequest, 'getQuery'> {
  getQuery(options?: ParseOptions): ParsedQuery<string | number | boolean>;
  query: ParsedQuery<string | number | boolean>;
}
export interface SifrrResponse<T = unknown> extends HttpResponse {
  /**
   * Get Body stream
   */
  bodyStream: Readable;
  /**
   * Get Request body buffer, is not available if stream or body is already used
   */
  bodyBuffer: Promise<Buffer>;
  /**
   * Request body, is not available if stream or buffer is already used
   */
  body: Promise<T>;
  /**
   * Sends json response with content-type `application/json`
   * @param obj Object to send
   */
  json(obj: any): void;
}

export type RequestHandler<T = unknown> = (
  res: SifrrResponse<T>,
  req: SifrrRequest
) => void | Promise<void>;
export type RequestFxn = (
  pattern: string,
  handler: (res: SifrrResponse, req: SifrrRequest) => void | Promise<void>
) => ISifrrServer;
export interface ISifrrServer {
  /** Listens to hostname & port. Callback hands either false or a listen socket. */
  listen(
    host: string,
    port: number,
    callback?: (port: number | false) => void | Promise<void>
  ): ISifrrServer;
  /** Listens to port. Callback hands either false or a listen socket. */
  listen(
    port: number,
    callback?: (port: number | false) => void | Promise<void>,
    _?: undefined
  ): ISifrrServer;
  /** Registers an HTTP GET handler matching specified URL pattern. */
  get: RequestFxn;
  /** Registers an HTTP POST handler matching specified URL pattern. */
  post: RequestFxn;
  /** Registers an HTTP OPTIONS handler matching specified URL pattern. */
  options: RequestFxn;
  /** Registers an HTTP DELETE handler matching specified URL pattern. */
  delete: RequestFxn;
  del: RequestFxn;
  /** Registers an HTTP PATCH handler matching specified URL pattern. */
  patch: RequestFxn;
  /** Registers an HTTP PUT handler matching specified URL pattern. */
  put: RequestFxn;
  /** Registers an HTTP HEAD handler matching specified URL pattern. */
  head: RequestFxn;
  /** Registers an HTTP CONNECT handler matching specified URL pattern. */
  connect: RequestFxn;
  /** Registers an HTTP TRACE handler matching specified URL pattern. */
  trace: RequestFxn;
  /** Registers an HTTP handler matching specified URL pattern on any HTTP method. */
  use: RequestFxn;
  any: RequestFxn;
  /** Registers a handler matching specified URL pattern where WebSocket upgrade requests are caught. */
  ws<UserData>(pattern: string, behavior: WebSocketBehavior<UserData>): ISifrrServer;
  /** Publishes a message under topic, for all WebSockets under this app. See WebSocket.publish. */
  publish(topic: string, message: string, isBinary?: boolean, compress?: boolean): boolean;
  /** Returns number of subscribers for this topic. */
  numSubscribers(topic: string): number;
  /** Closes all sockets including listen sockets. This will forcefully terminate all connections. */
  close(port?: number): ISifrrServer;
}

export type SendFileOptions = {
  filter?: (path: string) => boolean;
  lastModified?: boolean;
  headers?: { [name: string]: string };
  compress?: boolean;
  compressionOptions?: {
    priority?: ('gzip' | 'br' | 'deflate')[];
  } & (BrotliOptions | ZlibOptions);
};

export interface UploadedFile {
  /** Name of the form field associated with this file. */
  fieldname: string;
  /** Name of the file on the uploader's computer. */
  originalname: string;
  /**
   * Value of the `Content-Transfer-Encoding` header for this file.
   * @deprecated since July 2015
   * @see RFC 7578, Section 4.7
   */
  encoding: string;
  /** Value of the `Content-Type` header for this file. */
  mimetype: string;
  /** Size of the file in bytes. Is not set if useStream is true in config. */
  size: number;
  /**
   * A readable stream of this file. It is not available unless useStream is set to true in config.
   */
  stream: NodeJS.ReadableStream;
  /** Full path to the uploaded file. Only available when localDir is given in config and useStream is falsy.  */
  path: string;
  /** A Buffer containing the entire file. Only available if path is not used and useStream is falsy. */
  buffer: Buffer;
}

export type UploadFileConfig = busboy.BusboyConfig & {
  abortOnLimit?: boolean;
  /** Path to local disk directory. it will store the uploaded files to local disk if directory is given */
  localDir?: string;
};

export type ClusterConfig = {
  app: SifrrServer;
} & ({ port: number; ports: undefined } | { ports: number[]; port: undefined });

export {};
