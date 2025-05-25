declare global {
  interface Promise<T> {
    abort?: () => void;
  }

  interface Error {
    response?: any;
  }
}

export type BeforeOpts<T> = { url: string; options: SifrrFetchOptions<T> };

export type SifrrFetchOptions<T = any> = {
  // normal
  baseUrl?: string;
  headers?: { [name: string]: string };
  params?: { [name: string]: string | boolean | number | (string | boolean | number)[] };
  timeout?: number;
  body?: any;
  // hooks
  before?: (opts: BeforeOpts<T>) => MaybePromise<BeforeOpts<T> | void>;
  use?: (opts: BeforeOpts<T>) => MaybePromise<T>;
  after?: (response: T) => void;
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
