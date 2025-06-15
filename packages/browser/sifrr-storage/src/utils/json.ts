import { ObjectValue, Value } from '@/storages/types';

const toS = Object.prototype.toString;
const uId = '~SS%l3g5k3~';

export function parse(data: any): any {
  let ans = data;
  if (typeof data === 'string') {
    try {
      ans = data = JSON.parse(data);
    } catch (e) {
      // do nothing
    }
  }

  if (typeof data === 'string' && data.indexOf(uId) > 0) {
    const [type, av] = data.split(uId);

    if (type === 'ArrayBuffer') {
      ans = new Uint8Array(av?.split(',').map((i) => parseInt(i)) ?? []).buffer;
    } else if (type === 'BigInt') {
      ans = BigInt(av!);
    } else ans = new (global as any)[type as string]((av as string).split(','));
  } else if (Array.isArray(data)) {
    ans = [];
    data.forEach((v, i) => {
      ans[i] = parse(v);
    });
  } else if (typeof data === 'object') {
    if (data === null) return null;
    ans = {};
    for (const k in data) {
      ans[k] = parse(data[k]);
    }
  }
  return ans;
}

export function stringify(data: Value): string {
  if (typeof data !== 'object' && typeof data !== 'bigint') return JSON.stringify(data);
  if (data === null) return 'null';
  if (Array.isArray(data)) return JSON.stringify(data.map((d) => stringify(d)));
  const type = toS.call(data).slice(8, -1);
  if (type === 'Object') {
    const d = data as ObjectValue;
    const ans: any = {};
    for (const k in d) {
      ans[k] = stringify(d[k]!);
    }
    return JSON.stringify(ans);
  } else if (type === 'ArrayBuffer') {
    data = new Uint8Array(data as ArrayBuffer);
  }
  return type + uId + data.toString();
}
