const toS = Object.prototype.toString;
const uId = '~SS%l3g5k3~';

function decodeBlob(str: string, type: string) {
  return new Blob([new Uint8Array(str.split(',').map((i) => parseInt(i))).buffer], { type });
}

function encodeBlob(blob: Blob) {
  const uri = URL.createObjectURL(blob),
    xhr = new XMLHttpRequest();

  xhr.open('GET', uri, false);
  xhr.send();

  URL.revokeObjectURL(uri);

  const ui8 = new Uint8Array(xhr.response.length);
  for (let i = 0; i < xhr.response.length; ++i) {
    ui8[i] = xhr.response.charCodeAt(i);
  }
  return ui8.toString();
}

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
    const [type, av, av2] = data.split(uId);

    if (type === 'ArrayBuffer') {
      ans = new Uint8Array(av?.split(',').map((i) => parseInt(i)) ?? []).buffer;
    } else if (type === 'Blob') ans = decodeBlob(av2 as string, av as string);
    else ans = new (window as any)[type as string]((av as string).split(','));
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

export function stringify(data: any): string {
  if (typeof data !== 'object') return JSON.stringify(data);
  if (data === null) return 'null';
  if (Array.isArray(data)) return JSON.stringify(data.map((d) => stringify(d)));
  const type = toS.call(data).slice(8, -1);
  if (type === 'Object') {
    const ans: any = {};
    for (const k in data) {
      ans[k] = stringify(data[k]);
    }
    return JSON.stringify(ans);
  } else if (type === 'ArrayBuffer') {
    data = new Uint8Array(data as ArrayBuffer);
  } else if (type === 'Blob') {
    data = data.type + uId + encodeBlob(data);
  }
  return type + uId + data.toString();
}
