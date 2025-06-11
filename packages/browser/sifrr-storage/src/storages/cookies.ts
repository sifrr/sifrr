import { parse, stringify } from '@/utils/json';
import { SavedDataObject, SifrrStore } from './types';

const date = new Date(0).toUTCString();
const equal = '%3D',
  equalRegex = new RegExp(equal, 'g');
const all = (prefix: string) => {
  const result = document.cookie,
    ans: SavedDataObject = {};
  result.split('; ').forEach((value) => {
    const [k, v] = value.split('=');
    if (k?.startsWith(prefix)) {
      const parsed = parse(v?.replace(equalRegex, '='));
      if (typeof parsed === 'undefined') return;
      ans[k.substring(prefix.length)] = parsed;
    }
  });
  return ans;
};

class CookieStore implements SifrrStore {
  public static readonly isSupported: boolean =
    typeof window !== 'undefined' && typeof document.cookie !== 'undefined';
  prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  get(key: string) {
    return all(this.prefix)[key];
  }
  set(key: string, value: any) {
    document.cookie = `${this.prefix}${key}=${stringify(value).replace(/=/g, equal)}; path=/`;
    return this;
  }
  delete(key: string) {
    document.cookie = `${this.prefix}${key}=; path=/; expires=${date}`;
    return true;
  }
  clear() {
    Object.keys(this.all()).forEach(this.delete.bind(this));
  }
  has(key: string) {
    return this.get(key) !== undefined;
  }
  all() {
    return all(this.prefix);
  }
}

export default CookieStore;
