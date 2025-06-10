/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { SifrrServer } from '@/server/baseapp';
import { SifrrResponse } from '@/server/response';
import { SifrrRequest } from '@/server/types';
import { RequestMethod } from '@nestjs/common';
import { VersioningOptions, VersionValue } from '@nestjs/common/interfaces';
import { AbstractHttpAdapter } from '@nestjs/core';

export class SifrrHttpAdapter extends AbstractHttpAdapter<
  SifrrServer,
  SifrrRequest,
  SifrrResponse
> {
  close() {
    this.httpServer.close();
  }
  initHttpServer(options: Parameters<AbstractHttpAdapter['initHttpServer']>[0]) {
    const useSSL = options.httpsOptions?.ca;
    this.httpServer = new SifrrServer({
      ssl: useSSL,
      ca_file_name: options.httpsOptions?.ca,
      cert_file_name: options.httpsOptions?.cert,
      key_file_name: options.httpsOptions?.key,
      passphrase: options.httpsOptions?.passphrase,
      ssl_ciphers: options.httpsOptions?.ciphers
    });
  }
  useStaticAssets(..._args: any[]) {
    throw new Error('Method not implemented.');
  }
  setViewEngine(_engine: string) {
    throw new Error('Method not implemented.');
  }
  getRequestHostname(_request: SifrrRequest) {
    throw new Error('Method not implemented.');
  }
  getRequestMethod(request: SifrrRequest) {
    return request.getMethod().toUpperCase();
  }
  getRequestUrl(request: SifrrRequest) {
    return request.getUrl();
  }
  status(response: SifrrResponse, statusCode: number) {
    response.status(statusCode);
  }
  reply(_response: SifrrResponse, _body: any, _statusCode?: number) {
    throw new Error('Method not implemented.');
  }
  end(response: SifrrResponse, message?: string) {
    response.end(message);
  }
  render(_response: SifrrResponse, _view: string, _options: any) {
    throw new Error('Method not implemented.');
  }
  redirect(response: SifrrResponse, statusCode: number, url: string) {
    response.setHeader('Location', url).status(statusCode).end();
  }
  setErrorHandler(_handler: Function, _prefix?: string) {
    throw new Error('Method not implemented.');
  }
  setNotFoundHandler(_handler: Function, _prefix?: string) {
    throw new Error('Method not implemented.');
  }
  isHeadersSent(_response: SifrrResponse) {
    throw new Error('Method not implemented.');
  }
  getHeader(response: SifrrResponse, name: string) {
    response.getHeader(name);
  }
  setHeader(response: SifrrResponse, name: string, value: string) {
    response.setHeader(name, value);
  }
  appendHeader(response: SifrrResponse, name: string, value: string) {
    response.writeHeader(name, value);
  }
  registerParserMiddleware(_prefix?: string, _rawBody?: boolean) {
    throw new Error('Method not implemented.');
  }
  enableCors(_options?: any, _prefix?: string) {
    throw new Error('Method not implemented.');
  }
  createMiddlewareFactory(
    _requestMethod: RequestMethod
  ):
    | ((path: string, callback: Function) => any)
    | Promise<(path: string, callback: Function) => any> {
    throw new Error('Method not implemented.');
  }
  getType(): string {
    throw new Error('Method not implemented.');
  }
  applyVersionFilter(
    _handler: Function,
    _version: VersionValue,
    _versioningOptions: VersioningOptions
  ): (req: any, res: any, next: () => void) => Function {
    throw new Error('Method not implemented.');
  }
}
