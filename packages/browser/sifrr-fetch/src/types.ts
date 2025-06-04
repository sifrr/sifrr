declare global {
  interface Promise<T> {
    abort?: () => void;
  }

  interface Error {
    response?: any;
  }
}

export type BeforeOpts = { url: string; options: SifrrFetchOptions };

export type SifrrFetchResponse<T = any, E = any> = { status: number } & (
  | { data?: T; ok: true; errorData: undefined; response?: Response }
  | { data: undefined; ok: false; errorData: E; response: Response }
);

export type SifrrFetchOptions = {
  // normal
  baseUrl?: string;
  headers?: { [name: string]: string };
  params?: { [name: string]: string | boolean | number | (string | boolean | number)[] };
  timeout?: number;
  body?: RequestInit['body'] | object;
  // hooks
  before?: (opts: BeforeOpts) => MaybePromise<BeforeOpts | void>;
  use?: (opts: BeforeOpts) => MaybePromise<any>;
  after?: (response: SifrrFetchResponse) => SifrrFetchResponse;
  onProgress?: (progress: {
    loaded?: number;
    total?: number;
    percent: number;
    speed?: number;
    value?: Uint8Array;
  }) => void;
} & RequestInit;

export type MaybePromise<T> = T | Promise<T>;

export default {};
