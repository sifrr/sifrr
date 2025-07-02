export type SwOptions = {
  version?: number;
  fallbackCacheName?: string;
  defaultCacheName?: string;
  policies?: {
    [k: string]: {
      policy: string;
      cacheName?: string;
    };
  };
  fallbacks?: {
    [regex: string]: string;
  };
  precacheUrls?: Array<string>;
};
