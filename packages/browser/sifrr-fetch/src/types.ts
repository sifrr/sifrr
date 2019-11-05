declare global {
  interface Promise<T> {
    abort: () => void;
  }

  interface Error {
    response: any;
  }
}

export type beforeOpts = { url: string; options: SifrrFetchOptions; method: string };

export type SifrrFetchOptions = {
  // graphql
  query?: string;
  variables?: {};
  // normal
  method?: string;
  host?: string;
  headers?: { [name: string]: string };
  params?: { [name: string]: string };
  body?: any;
  timeout?: number;
  // hooks
  before?: (opts: beforeOpts) => MaybePromise<beforeOpts>;
  use?: (opts: beforeOpts) => MaybePromise<beforeOpts>;
  after?: (response: any) => any;
  onProgress?: (progress: {
    loaded?: number;
    total?: number;
    percent: number;
    speed?: number;
    value?: Uint8Array;
  }) => void;
  // default options
  defaultOptions?: SifrrFetchOptions;
} & RequestInit;

export type MaybePromise<T> = T | Promise<T>;
