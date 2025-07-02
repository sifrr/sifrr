export type StorageOptions = {
  prefix?: string;
  stores: SifrrStoreConstructor | Readonly<SifrrStoreConstructor[]>;
};

type PrimitiveType =
  | ArrayBuffer
  | Float16Array
  | Float32Array
  | Float64Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Uint8Array
  | Uint8ClampedArray
  | Uint16Array
  | Uint32Array
  | number
  | string
  | boolean
  | undefined
  | null
  | bigint;
export interface ObjectValue {
  [index: number | string]: PrimitiveType | PrimitiveType[] | ObjectValue;
}
export type Value = PrimitiveType | PrimitiveType[] | ObjectValue;

export type SavedData = {
  ttl: number;
  createdAt: number;
  value: Value;
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
  set(key: string, value: SavedData): MaybePropmise<SifrrStore>;
  delete(key: string): MaybePropmise<boolean>;
  clear(): MaybePropmise<void>;
  has(key: string): MaybePropmise<boolean>;
  all(): MaybePropmise<SavedDataObject>;
}

export default {};
