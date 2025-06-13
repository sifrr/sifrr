import { isObject } from '@/util';

const WebSocketKlass =
  typeof WebSocket !== 'undefined'
    ? WebSocket
    : class WS {
        constructor() {
          throw new Error('WebSocket is not supported in this environment.');
        }
        readyState = 3;
      };

class Socket implements EventTarget {
  private id = 1;
  private _requests: Record<
    number,
    {
      res: (value: unknown) => void;
      rej: (reason?: any) => void;
      original: unknown;
    }
  > = {};
  private readonly options: {
    reconnect?: boolean;
    reconnectInterval?: number | ((attempt: number) => number);
    defaultFetchTimeout?: number;
  };
  private attempt = 1;
  private ws: WebSocket & {
    __close__?: boolean;
  };

  url: string | URL;
  protocol?: string;
  onretry?: (attempt: number, interval: number) => void;

  constructor(url: string | URL, protocol?: string, options: typeof this.options = {}) {
    this.ws = new WebSocketKlass(url, protocol) as WebSocket;
    this.id = 1;
    this.url = url;
    this.protocol = protocol;
    this.options = options;
    this.ws.addEventListener('message', this._onmessage.bind(this));
    this.ws.addEventListener('error', this._onerror.bind(this));
    this.ws.addEventListener('close', this._onerror.bind(this));
  }

  send(payload: object | string | ArrayBufferLike | Blob | ArrayBufferView) {
    if (isObject(payload)) {
      this.sendRaw(JSON.stringify(payload), undefined, payload);
    } else {
      this.sendRaw(payload, undefined, payload);
    }
  }

  /**
   * Sends a message to the server with data { name, payload, id: unique message if } and returns a promise that resolves
   * when the server responds with data having the same id ({ id, payload }).
   *
   * @param payload payload to send
   * @param name name of message, defaults to 'sifrr-fetch'
   * @param timeout timeout in milliseconds to wait for response, defaults to options.defaultFetchTimeout or 1000,
   * set to 0 to disable timeout.
   * @returns
   */
  fetch<T = any>(
    payload: object | string,
    name = 'sifrr-fetch',
    timeout = this.options.defaultFetchTimeout ?? 1000
  ): Promise<T> {
    const message = {
      payload,
      name,
      id: this.id++
    };
    return this.sendRaw(JSON.stringify(message), message.id, payload, timeout) as Promise<T>;
  }

  close() {
    this.ws.__close__ = true;
    this.ws.close();
  }

  private async sendRaw<T = any>(
    message: string | ArrayBufferLike | Blob | ArrayBufferView,
    id?: number,
    original: typeof message | object = message,
    timeout = 5000
  ): Promise<T | undefined> {
    const ws = await this.waitForSocket();
    ws.send(message);
    if (!id) return;
    return new Promise((res, rej) => {
      this._requests[id] = {
        res: (v_1: unknown) => {
          delete this._requests[id];
          res(v_1 as T);
        },
        rej,
        original
      };
      if (timeout) {
        setTimeout(() => {
          if (this._requests[id]) {
            delete this._requests[id];
            rej(new Error(`Websocket Fetch timed out after ${timeout}ms: ${original}`));
          }
        }, timeout);
      }
    });
  }

  async waitForSocket(): Promise<WebSocket> {
    if (this.ws.readyState === this.ws.OPEN) {
      return this.ws;
    } else if (this.ws.readyState !== this.ws.CONNECTING) {
      this.ws = new WebSocketKlass(this.url, this.protocol) as WebSocket;
      return this.ws;
    }
    return new Promise((res, rej) => {
      const waiting = () => {
        if (this.ws.readyState === this.ws.CONNECTING) {
          setTimeout(waiting, 100);
        } else if (this.ws.readyState !== this.ws.OPEN) {
          rej(Error(`Failed to open socket on ${this.url.toString()}`));
        } else {
          res(this.ws);
        }
      };
      waiting();
    });
  }

  private _onmessage(event: MessageEvent<string>) {
    const data = JSON.parse(event.data);
    if (data.id && this._requests[data.id]) {
      this._requests[data.id]?.res(data.payload);
    }
  }

  private _onerror() {
    for (const id in this._requests) {
      const req = this._requests[id];
      req?.rej(new Error(`WebSocket closed before getting response back: ${req.original}`));
      delete this._requests[id];
    }
    if (this.options.reconnect && !this.ws.__close__) {
      const interval =
        typeof this.options.reconnectInterval === 'function'
          ? this.options.reconnectInterval(this.attempt)
          : (this.options.reconnectInterval ?? 1000);
      this.onretry?.(this.attempt, interval);
      this.dispatchEvent(
        new CustomEvent('retry', {
          detail: {
            attempt: this.attempt,
            interval
          }
        })
      );
      setTimeout(() => {
        this.waitForSocket();
      }, interval);
      this.attempt++;
    }
  }

  // pass through WebSocket methods
  set onmessage(fn: (event: MessageEvent<string>) => void) {
    this.ws.onmessage = fn;
  }
  set onerror(fn: (event: Event) => void) {
    this.ws.onerror = fn;
  }
  set onopen(fn: (event: Event) => void) {
    this.ws.onopen = fn;
  }
  set onclose(fn: (event: CloseEvent) => void) {
    this.ws.onclose = fn;
  }
  addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean
  ): void {
    this.ws.addEventListener(type, callback, options);
  }
  dispatchEvent(event: Event): boolean {
    return this.ws.dispatchEvent(event);
  }
  removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject,
    options?: EventListenerOptions | boolean
  ): void {
    this.ws.removeEventListener(type, callback, options);
  }
}

export default Socket;
