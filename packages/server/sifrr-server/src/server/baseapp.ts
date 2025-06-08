import { readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { Readable, ReadableOptions } from 'stream';
import {
  us_listen_socket_close,
  TemplatedApp,
  SSLApp,
  App,
  AppOptions,
  us_listen_socket,
  HttpResponse,
  HttpRequest,
  WebSocketBehavior,
  us_socket_local_port
} from 'uWebSockets.js';
import * as Graphql from 'graphql';
import { buffer, json, text } from 'stream/consumers';

import sendFile from './sendfile';
import formData from './formdata';
import { graphqlPost, graphqlWs } from './graphql';
import {
  SendFileOptions,
  SifrrServerOptions,
  SifrrResponse,
  SifrrRequest,
  ISifrrServer,
  RequestHandler,
  UploadFileConfig
} from './types';
import { GraphQLArgs, GraphQLSchema } from 'graphql';
import { parse, ParseOptions } from 'query-string';

const formDataContentTypes = ['application/x-www-form-urlencoded', 'multipart/form-data'];
const noOp = () => true;
const bodyUserError = Error(
  'Stream was already read. You can only read of body, bodyBuffer, bodyStream.'
);

const handleBody = <T>(res: SifrrResponse, req: SifrrRequest, uploadConfig?: UploadFileConfig) => {
  const contType = req.getHeader('content-type');

  res.bodyStream = new Readable();
  res.bodyStream._read = noOp;

  res.onData((ab, isLast) => {
    res.bodyStream.push(Buffer.from(ab));
    if (isLast) {
      res.bodyStream.push(null);
    }
  });

  Object.defineProperty(res, 'bodyBuffer', {
    get() {
      if (res.bodyStream.closed) {
        throw bodyUserError;
      }
      return buffer(res.bodyStream);
    }
  });

  Object.defineProperty(res, 'body', {
    async get(): Promise<T> {
      if (res.bodyStream.closed) {
        throw bodyUserError;
      }
      if (contType.indexOf('application/json') > -1) {
        return json(res.bodyStream) as T;
      } else if (formDataContentTypes.map((t) => contType.indexOf(t) > -1).indexOf(true) > -1) {
        return formData.call(
          res,
          {
            'content-type': contType
          },
          uploadConfig
        ) as T;
      } else {
        return text(res.bodyStream) as T;
      }
    }
  });
};

function handleRequest(
  handler: RequestHandler,
  uploadConfig?: UploadFileConfig
): (res: HttpResponse, req: HttpRequest) => void | Promise<void> {
  return (res, req) => {
    if (['post', 'put', 'patch'].includes(req.getMethod()))
      handleBody(res as SifrrResponse, req as unknown as SifrrRequest, uploadConfig);

    res.onAborted(() => {
      res.aborted = true;
    });
    res._write = res.write;
    res.write = (body) => {
      let ret = true;
      if (res.aborted) return ret;
      res.cork(() => {
        ret = res.write(body);
      });
      return ret;
    };
    res._end = res.end;
    res.end = (body, close) => {
      if (res.aborted) return res;
      res.cork(() => {
        return res._end(body, close);
      });
      return res;
    };
    res._tryEnd = res.tryEnd;
    res.tryEnd = (body, size) => {
      let ret = [true, true] as [boolean, boolean];
      if (res.aborted) return ret;
      res.cork(() => {
        ret = res._tryEnd(body, size);
      });
      return ret;
    };
    res.json = (obj: any) => {
      res.cork(() => {
        res.writeHeader('content-type', 'application/json');
        res.end(JSON.stringify(obj));
      });
    };
    const orig = req.getQuery.bind(req);
    (req as unknown as SifrrRequest).getQuery = (options?: ParseOptions) =>
      parse(orig() as unknown as string, {
        parseBooleans: true,
        parseNumbers: true,
        decode: true,
        ...options
      });

    Object.defineProperty(req, 'query', {
      get() {
        return this.getQuery();
      }
    });

    const promise = handler(res as SifrrResponse, req as unknown as SifrrRequest);
    if (promise instanceof Promise) {
      promise.catch((e) => {
        console.error(e);
        res.writeStatus('500 Internal Server Error');
        res.end();
      });
    }
  };
}

export class SifrrServer implements ISifrrServer {
  private readonly _sockets = new Map<number, us_listen_socket>();
  private readonly app: TemplatedApp;
  private readonly config?: SifrrServerOptions;

  constructor(options?: SifrrServerOptions) {
    this.app = options?.ssl ? SSLApp(options ?? {}) : App(options ?? {});
    this.config = options;
  }

  // just pass through
  publish(topic: string, message: string, isBinary?: boolean, compress?: boolean): boolean {
    return this.app.publish(topic, message, isBinary, compress);
  }
  numSubscribers(topic: string): number {
    return this.app.numSubscribers(topic);
  }
  get(pattern: string, handler: RequestHandler) {
    this.app.get(pattern, handleRequest(handler));
    return this;
  }
  head(pattern: string, handler: RequestHandler) {
    this.app.head(pattern, handleRequest(handler));
    return this;
  }
  del(pattern: string, handler: RequestHandler) {
    this.app.del(pattern, handleRequest(handler));
    return this;
  }
  delete(pattern: string, handler: RequestHandler) {
    this.app.del(pattern, handleRequest(handler));
    return this;
  }
  options(pattern: string, handler: RequestHandler) {
    this.app.options(pattern, handleRequest(handler));
    return this;
  }
  post<T>(pattern: string, handler: RequestHandler<T>, formDataConfig?: UploadFileConfig) {
    this.app.post(pattern, handleRequest(handler as RequestHandler, formDataConfig));
    return this;
  }
  put<T>(pattern: string, handler: RequestHandler<T>, formDataConfig?: UploadFileConfig) {
    this.app.put(pattern, handleRequest(handler as RequestHandler, formDataConfig));
    return this;
  }
  patch<T>(pattern: string, handler: RequestHandler<T>, formDataConfig?: UploadFileConfig) {
    this.app.patch(pattern, handleRequest(handler as RequestHandler, formDataConfig));
    return this;
  }
  use(pattern: string, handler: RequestHandler) {
    this.app.any(pattern, handleRequest(handler));
    return this;
  }
  any(pattern: string, handler: RequestHandler) {
    this.app.any(pattern, handleRequest(handler));
    return this;
  }
  connect(pattern: string, handler: RequestHandler) {
    this.app.connect(pattern, handleRequest(handler));
    return this;
  }
  trace(pattern: string, handler: RequestHandler) {
    this.app.trace(pattern, handleRequest(handler));
    return this;
  }
  ws<T>(pattern: string, behavior: WebSocketBehavior<T>) {
    this.app.ws(pattern, behavior);
    return this;
  }

  graphql(
    route: string,
    schema: GraphQLSchema,
    graphqlOptions: Partial<GraphQLArgs> & {
      graphiqlPath?: string;
    },
    uwsOptions: AppOptions,
    graphql: typeof Graphql
  ) {
    const handler = graphqlPost(schema, graphqlOptions, graphql);
    this.post(route, handler);
    this.app.ws(route, graphqlWs(schema, graphqlOptions, uwsOptions, graphql));
    if (graphqlOptions && graphqlOptions.graphiqlPath)
      this.file(graphqlOptions.graphiqlPath, join(__dirname, './graphiql.html'));
    return this;
  }

  sendFile(filePath: string, options: SendFileOptions = {}): RequestHandler {
    return sendFile.bind(this, filePath, options);
  }

  file(pattern: string, filePath: string, options: SendFileOptions = {}) {
    return this.get(pattern, sendFile.bind(this, filePath, options));
  }

  folder(prefix: string, folder: string, options: SendFileOptions = {}, base: string = folder) {
    // not a folder
    if (!statSync(folder).isDirectory()) {
      throw Error('Given path is not a directory: ' + folder);
    }

    // ensure slash in beginning and no trailing slash for prefix
    if (!prefix.startsWith('/')) prefix = '/' + prefix;
    if (prefix.endsWith('/')) prefix = prefix.slice(0, -1);

    // serve folder
    const filter = options ? options.filter || noOp : noOp;
    readdirSync(folder).forEach((file) => {
      // Absolute path
      const filePath = join(folder, file);
      // Return if filtered
      if (!filter(filePath)) return;

      if (statSync(filePath).isDirectory()) {
        // Recursive if directory
        this.folder(prefix, filePath, options, base);
      } else {
        this.file(prefix + '/' + relative(base, filePath), filePath, options);
      }
    });

    return this;
  }

  listen: ISifrrServer['listen'] = (hostOrPort, portOrCallback, callback) => {
    if (typeof portOrCallback === 'number' && typeof hostOrPort === 'string') {
      this.app.listen(hostOrPort, portOrCallback, (socket) => {
        if (socket) this._sockets.set(portOrCallback, socket);
        callback?.(socket && us_socket_local_port(socket));
      });
    } else if (typeof hostOrPort === 'number') {
      this.app.listen(hostOrPort, (socket) => {
        if (socket) this._sockets.set(hostOrPort, socket);
        if (typeof portOrCallback === 'function')
          portOrCallback?.(socket && us_socket_local_port(socket));
      });
    } else {
      throw Error(
        'Argument types should be: (host: string, port: number, cb?: Function) | (port: number, cb?: Function) for listen'
      );
    }

    return this;
  };

  close(port?: number) {
    if (port) {
      this._sockets.has(port) && us_listen_socket_close(this._sockets.get(port)!);
      this._sockets.delete(port);
    } else {
      this._sockets.forEach((app) => {
        us_listen_socket_close(app);
      });
      this._sockets.clear();
    }
    if (this._sockets.size === 0) {
      this.app.close();
    }
    return this;
  }
}
