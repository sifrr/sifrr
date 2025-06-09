import { readdirSync, statSync } from 'fs';
import { basename, join, relative } from 'path';
import {
  us_listen_socket_close,
  TemplatedApp,
  SSLApp,
  App,
  us_listen_socket,
  HttpResponse,
  HttpRequest,
  WebSocketBehavior,
  us_socket_local_port
} from 'uWebSockets.js';
import * as Graphql from 'graphql';

import sendFile from './sendfile';
import { graphqlPost, graphqlWs } from './graphql';
import {
  SendFileOptions,
  SifrrServerOptions,
  SifrrRequest,
  ISifrrServer,
  RequestHandler,
  FormDataConfig,
  KeysMatching,
  AllQuery
} from './types';
import { GraphQLArgs, GraphQLSchema } from 'graphql';
import { parse, ParseOptions } from 'query-string';
import { SifrrResponse } from '@/server/response';

const noOp = () => true;

function handleRequest(
  handler: RequestHandler,
  uploadConfig?: FormDataConfig
): (res: HttpResponse, req: HttpRequest) => void | Promise<void> {
  return (res, req) => {
    let handleBody = false;
    if (['post', 'put', 'patch'].includes(req.getMethod())) handleBody = true;

    // setup response
    const sifrrRes = new SifrrResponse(res, req, handleBody, uploadConfig);

    // setup request
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

    const promise = handler(req as unknown as SifrrRequest, sifrrRes);
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
    const { ssl, ..._options } = options ?? {};
    this.app = ssl ? SSLApp(_options) : App(_options);
    this.config = options;
  }

  // just pass through
  publish(topic: string, message: string, isBinary?: boolean, compress?: boolean): boolean {
    return this.app.publish(topic, message, isBinary, compress);
  }
  numSubscribers(topic: string): number {
    return this.app.numSubscribers(topic);
  }
  get<Params extends string | number = string | number, Query extends AllQuery = AllQuery>(
    pattern: string,
    handler: RequestHandler<Params, Query>
  ) {
    this.app.get(pattern, handleRequest(handler as RequestHandler));
    return this;
  }
  head<Params extends string | number = string | number, Query extends AllQuery = AllQuery>(
    pattern: string,
    handler: RequestHandler<Params, Query>
  ) {
    this.app.head(pattern, handleRequest(handler as RequestHandler));
    return this;
  }
  del<Params extends string | number = string | number, Query extends AllQuery = AllQuery>(
    pattern: string,
    handler: RequestHandler<Params, Query>
  ) {
    this.app.del(pattern, handleRequest(handler as RequestHandler));
    return this;
  }
  delete<Params extends string | number = string | number, Query extends AllQuery = AllQuery>(
    pattern: string,
    handler: RequestHandler<Params, Query>
  ) {
    this.app.del(pattern, handleRequest(handler as RequestHandler));
    return this;
  }
  options<Params extends string | number = string | number, Query extends AllQuery = AllQuery>(
    pattern: string,
    handler: RequestHandler<Params, Query>
  ) {
    this.app.options(pattern, handleRequest(handler as RequestHandler));
    return this;
  }
  post<
    Body = unknown,
    Params extends string | number = string | number,
    Query extends AllQuery = AllQuery
  >(
    pattern: string,
    handler: RequestHandler<Params, Query, Body>,
    formDataConfig?: FormDataConfig<KeysMatching<Body, string>>
  ) {
    this.app.post(pattern, handleRequest(handler as RequestHandler, formDataConfig));
    return this;
  }
  put<
    Body = unknown,
    Params extends string | number = string | number,
    Query extends AllQuery = AllQuery
  >(
    pattern: string,
    handler: RequestHandler<Params, Query, Body>,
    formDataConfig?: FormDataConfig<KeysMatching<Body, string>>
  ) {
    this.app.put(pattern, handleRequest(handler as RequestHandler, formDataConfig));
    return this;
  }
  patch<
    Body = unknown,
    Params extends string | number = string | number,
    Query extends AllQuery = AllQuery
  >(
    pattern: string,
    handler: RequestHandler<Params, Query, Body>,
    formDataConfig?: FormDataConfig<KeysMatching<Body, string>>
  ) {
    this.app.patch(pattern, handleRequest(handler as RequestHandler, formDataConfig));
    return this;
  }
  use<Params extends string | number = string | number, Query extends AllQuery = AllQuery>(
    pattern: string,
    handler: RequestHandler<Params, Query>
  ) {
    this.app.any(pattern, handleRequest(handler as RequestHandler));
    return this;
  }
  any<Params extends string | number = string | number, Query extends AllQuery = AllQuery>(
    pattern: string,
    handler: RequestHandler<Params, Query>
  ) {
    this.app.any(pattern, handleRequest(handler as RequestHandler));
    return this;
  }
  connect<Params extends string | number = string | number, Query extends AllQuery = AllQuery>(
    pattern: string,
    handler: RequestHandler<Params, Query>
  ) {
    this.app.connect(pattern, handleRequest(handler as RequestHandler));
    return this;
  }
  trace<Params extends string | number = string | number, Query extends AllQuery = AllQuery>(
    pattern: string,
    handler: RequestHandler<Params, Query>
  ) {
    this.app.trace(pattern, handleRequest(handler as RequestHandler));
    return this;
  }
  ws<T>(pattern: string, behavior: WebSocketBehavior<T>) {
    this.app.ws(pattern, behavior);
    return this;
  }

  graphql<T>(
    route: string,
    schema: GraphQLSchema,
    graphqlOptions: Partial<GraphQLArgs> & {
      graphiqlPath?: string;
    },
    uwsOptions: WebSocketBehavior<T>,
    graphql: typeof Graphql
  ) {
    this.post(route, graphqlPost(schema, graphqlOptions, graphql));
    this.app.ws(route, graphqlWs<T>(schema, graphqlOptions, uwsOptions, graphql));
    if (graphqlOptions?.graphiqlPath)
      this.file(graphqlOptions.graphiqlPath, join(__dirname, './graphiql.html'));
    return this;
  }

  sendFile(filePath: string, options: SendFileOptions = {}): RequestHandler {
    return sendFile.bind(undefined, filePath, options);
  }

  file(pattern: string, filePath: string, options: SendFileOptions = {}) {
    if (!statSync(filePath).isFile()) {
      throw Error(`${filePath} is not a file.`);
    }
    return this.app.get(pattern, (res, req) => sendFile(filePath, options, req, res));
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
        if (basename(filePath) === 'index.html') {
          this.file(prefix || '/', filePath, options);
        }
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
