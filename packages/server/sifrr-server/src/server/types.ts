import { SifrrResponse } from '@/server/response';
import { BusboyConfig } from 'busboy';
import { ParsedQuery, ParseOptions } from 'query-string';
import { AppOptions, WebSocketBehavior, HttpRequest } from 'uWebSockets.js';
import { ZlibOptions, BrotliOptions } from 'zlib';

export type SifrrServerOptions = AppOptions & {
  ssl?: boolean;
};
export type AllQuery = ParsedQuery<string | number | boolean>;
export interface SifrrRequest<
  Params extends string | number = string | number,
  Query extends AllQuery = AllQuery
> extends Omit<HttpRequest, 'getQuery' | 'getParameter'> {
  getQuery(options?: ParseOptions): Query;
  query: Query;
  getParameter(name: Params): string | undefined;
}

export type RequestHandler<
  Params extends string | number = string | number,
  Query extends AllQuery = AllQuery,
  Body = unknown
> = (req: SifrrRequest<Params, Query>, res: SifrrResponse<Body>) => void | Promise<void>;
export type Middleware<
  Params extends string | number = string | number,
  Query extends AllQuery = AllQuery,
  Body = unknown
> = (req: SifrrRequest<Params, Query>, res: SifrrResponse<Body>) => boolean | Promise<boolean>;
export type RequestFxn = (pattern: string, handler: RequestHandler) => ISifrrServer;
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
  use: (handler: Middleware) => ISifrrServer;
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
  mimeType: string;
  /**
   * A readable stream of this file. It is not available if localDir was set given in FormDataConfig.
   */
  stream: NodeJS.ReadableStream;
  /** File buffer, only available if destinationDir was not given in FormDataConfig. */
  buffer: Buffer;
  /** Destination folder of file uploaded, is same as destinationDir given in FormDataConfig. */
  destination: string;
  /** Full path to the uploaded file. Only available when localDir is given in FormDataConfig.  */
  path: string;
  /** Size of file uploaded in bytes */
  size: number;
}

export type FormDataConfig<T extends string = string> = Omit<BusboyConfig, 'headers'> & {
  /**
   * Path to local disk directory. it will store the uploaded files to local disk if directory is given
   * Path where file is saved will be added to UploadedFile.path
   */
  destinationDir?: string;
  /**
   * Filter function for files, if it return false, files will be ignored.
   */
  filterFile?(fileInfo: UploadedFile): boolean;
  /**
   * Add custom handler for reading file streams, if it is provided buffer/path will not be available in uploaded file info
   */
  handleFileStream?(
    fileInfo: Omit<UploadedFile, 'buffer' | 'destination' | 'path' | 'size'>
  ): void | Promise<void>;
  /**
   * Config for file fields.
   * If undefined, all files and fields are allowed.
   */
  fields?: Partial<
    Record<
      T,
      {
        /**
         * Any files > maxCount for a field will be ignored
         * If max count is >1, field value will always be an array and if it's <= 1 it will always be single value
         */
        maxCount?: number;
        /**
         * Default value for field
         */
        default?: string | string[] | UploadedFile | UploadedFile[];
      }
    >
  >;
};

export type KeysMatching<T, V> = Extract<keyof T, V>;

export {};
