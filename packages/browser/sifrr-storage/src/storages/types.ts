export type StorageOptions = {
  prefix?: string;
  stores: SifrrStoreConstructor | Readonly<SifrrStoreConstructor[]>;
};

export type SavedData = {
  ttl: number;
  createdAt: number;
  value: any;
};

export type SavedDataObject = {
  [k: string]: SavedData;
};

export type StorageType = 'memory' | 'localstorage' | 'indexeddb' | 'cookie';

type MaybePropmise<T> = T | Promise<T>;

export interface SifrrStoreConstructor {
  isSupported: boolean;
  new (prefix: string): SifrrStore;
}

export interface SifrrStore {
  prefix: string;
  get(key: string): MaybePropmise<SavedData | undefined>;
  set(key: string, value: any): MaybePropmise<SifrrStore>;
  delete(key: string): MaybePropmise<boolean>;
  clear(): MaybePropmise<void>;
  has(key: string): MaybePropmise<boolean>;
  all(): MaybePropmise<SavedDataObject>;
}

export default {};
