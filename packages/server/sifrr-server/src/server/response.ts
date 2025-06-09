import formData from '@/server/formdata';
import { FormDataConfig } from '@/server/types';
import { writeHeaders } from '@/server/utils';
import { Readable } from 'stream';
import { buffer, json, text } from 'stream/consumers';
import { HttpRequest, HttpResponse, RecognizedString, us_socket_context_t } from 'uWebSockets.js';

const bodyUsedError = Error(
  'Stream was already read. You can only read one of body, bodyBuffer, bodyStream and only once.'
);
const noOp = () => true;
const formDataContentTypes = ['application/x-www-form-urlencoded', 'multipart/form-data'];

export class SifrrResponse<T = unknown> implements Omit<HttpResponse, 'onData'> {
  readonly _res: HttpResponse;
  private readonly _req: HttpRequest;
  private readonly uploadConfig: FormDataConfig | undefined;
  private _status: number = 200;
  private _headers: Record<string, string> = Object.create(null);
  [k: string]: any;
  /**
   * Get Body stream, is not available if bodyBuffer or body is already used
   */
  bodyStream: Readable;
  /**
   * It is true if request has been already aborted
   */
  aborted: boolean;

  constructor(
    res: HttpResponse,
    req: HttpRequest,
    handleBody?: boolean,
    uploadConfig?: FormDataConfig
  ) {
    this._res = res;
    this._req = req;
    this.uploadConfig = uploadConfig;
    this.aborted = false;
    res.onAborted(() => {
      this.aborted = true;
    });

    this.bodyStream = new Readable();
    this.bodyStream._read = noOp;
    if (handleBody) {
      res.onData((ab, isLast) => {
        this.bodyStream.push(Buffer.from(ab));
        if (isLast) {
          this.bodyStream.push(null);
        }
      });
    }
  }

  /**
   * Get Request body buffer, is not available if stream or body is already used
   */
  get bodyBuffer() {
    if (this.bodyStream.closed) {
      throw bodyUsedError;
    }
    return buffer(this.bodyStream);
  }

  /**
   * Request body, is not available if stream or buffer is already used
   */
  get body(): Promise<T> {
    if (this.bodyStream.closed) {
      throw bodyUsedError;
    }
    const contType = this._req.getHeader('content-type');
    if (contType.indexOf('application/json') > -1) {
      return json(this.bodyStream) as Promise<T>;
    } else if (formDataContentTypes.map((t) => contType.indexOf(t) > -1).indexOf(true) > -1) {
      return formData<T>(
        this.bodyStream,
        {
          'content-type': contType
        },
        this.uploadConfig
      );
    } else {
      return text(this.bodyStream) as Promise<T>;
    }
  }

  /**
   * Sends json response with content-type `application/json`
   * @param obj Object to send
   */
  json(obj: any): void {
    this._res.cork(() => {
      this.setHeader('content-type', 'application/json');
      this.writeStatus(`${this._status}`);
      writeHeaders(this._res, this._headers);
      this._res.end(JSON.stringify(obj));
    });
  }
  /**
   * Set headers to be sent, will be added when `send` or `json` is called
   * @param name Name of header
   * @param value Value of header
   */
  setHeader(name: string, value: string): this {
    this._headers[name.toLowerCase()] = value;
    return this;
  }
  /**
   * Get header value set by `setHeader`
   * @param name Name of header
   */
  getHeader(name: string): string | undefined {
    return this._headers[name.toLowerCase()];
  }
  /**
   * Sets status of response, will be added when `send` or `json` is called
   * @param status Status code
   */
  status(status: number): this {
    this._status = status;
    return this;
  }
  /**
   * Send headers set using `setHeader`
   */
  sendHeaders(): this {
    writeHeaders(this._res, this._headers);
    return this;
  }
  /**
   * Sends response body and closes request, sets headers and status set from `setHeader`, `status` methods
   * @param status Status code
   */
  send(body?: any): void {
    this._res.cork(() => {
      this._res.writeStatus(`${this._status}`);
      writeHeaders(this._res, this._headers);
      this._res._end(body);
    });
  }
  write(chunk: RecognizedString): boolean {
    let ret = true;
    if (this.aborted) return ret;
    this._res.cork(() => {
      ret = this._res.write(chunk);
    });
    return ret;
  }
  end(body?: RecognizedString, closeConnection?: boolean): this {
    if (this.aborted) return this;
    this._res.cork(() => {
      return this._res.end(body, closeConnection);
    });
    return this;
  }
  endWithoutBody(reportedContentLength?: number, closeConnection?: boolean): this {
    this._res.cork(() => {
      return this._res.endWithoutBody(reportedContentLength, closeConnection);
    });
    return this;
  }
  tryEnd(fullBodyOrChunk: RecognizedString, totalSize: number): [boolean, boolean] {
    let ret = [true, true] as [boolean, boolean];
    if (this.aborted) return ret;
    this._res.cork(() => {
      ret = this._res.tryEnd(fullBodyOrChunk, totalSize);
    });
    return ret;
  }
  // pass as is
  pause(): void {
    this._res.pause();
  }
  resume(): void {
    this._res.resume();
  }
  writeStatus(status: RecognizedString): this {
    this._res.writeStatus(status);
    return this;
  }
  writeHeader(key: RecognizedString, value: RecognizedString): this {
    this._res.writeHeader(key, value);
    return this;
  }
  close(): this {
    this._res.close();
    return this;
  }
  getWriteOffset(): number {
    return this._res.getWriteOffset();
  }
  onWritable(handler: (offset: number) => boolean): this {
    this._res.onWritable(handler);
    return this;
  }
  onAborted(handler: () => void): this {
    this._res.onAborted(handler);
    return this;
  }
  getRemoteAddress(): ArrayBuffer {
    return this._res.getRemoteAddress();
  }
  getRemoteAddressAsText(): ArrayBuffer {
    return this._res.getRemoteAddressAsText();
  }
  getProxiedRemoteAddress(): ArrayBuffer {
    return this._res.getProxiedRemoteAddress();
  }
  getProxiedRemoteAddressAsText(): ArrayBuffer {
    return this._res.getProxiedRemoteAddressAsText();
  }
  cork(cb: () => void): this {
    this._res.cork(cb);
    return this;
  }
  upgrade<UserData>(
    userData: UserData,
    secWebSocketKey: RecognizedString,
    secWebSocketProtocol: RecognizedString,
    secWebSocketExtensions: RecognizedString,
    context: us_socket_context_t
  ): void {
    this._res.upgrade(
      userData,
      secWebSocketKey,
      secWebSocketProtocol,
      secWebSocketExtensions,
      context
    );
  }
}
