export type StorageOptions = {
  name?: string;
  version?: string | number;
  description?: string;
  size?: number;
  ttl?: number;
};

export type SavedData = {
  ttl: number;
  createdAt: number;
  value: any;
};

export type SavedDataObject = {
  [k: string]: SavedData;
};

export default {};
